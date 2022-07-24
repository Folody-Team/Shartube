package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"log"

	"github.com/Folody-Team/Shartube/database/comic_model"
	"github.com/Folody-Team/Shartube/database/session_model"
	"github.com/Folody-Team/Shartube/database/user_model"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/helper"
	"github.com/Folody-Team/Shartube/middleware/authMiddleware"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

// Login is the resolver for the Login field.
func (r *mutationResolver) Login(ctx context.Context, input model.LoginUserInput) (*model.UserLoginOrRegisterResponse, error) {
	UserModel, err := user_model.InitUserModel()
	if err != nil {
		return nil, err
	}
	user, err := UserModel.FindOne(bson.D{
		{Key: "$or", Value: []interface{}{
			bson.D{{Key: "email", Value: input.UsernameOrEmail}},
			bson.D{{Key: "username", Value: input.UsernameOrEmail}},
		}},
	})
	if err != nil {
		if err == bson.ErrDecodeToNil {
			return nil, gqlerror.Errorf("user not found")
		}
		return nil, err
	}
	err = bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(input.Password))
	if err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return nil, gqlerror.Errorf("password or email or user name is incorrect")
		}
		return nil, err
	}
	user.Password = nil
	log.Println(user.ID)
	accessToken, err := helper.GenSessionToken(
		string(user.ID),
	)
	if err != nil {
		return nil, err
	}

	return &model.UserLoginOrRegisterResponse{
		User:        user,
		AccessToken: *accessToken,
	}, nil
}

// Register is the resolver for the Register field.
func (r *mutationResolver) Register(ctx context.Context, input model.RegisterUserInput) (*model.UserLoginOrRegisterResponse, error) {
	// contribute by phatdev
	// add detect email format

	UserModel, err := user_model.InitUserModel()
	if err != nil {
		return nil, err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	input.Password = string(hashedPassword)
	id, err := UserModel.New(&input).Save()
	if err != nil {
		return nil, err
	}
	_id := id.Hex()
	user, err := UserModel.FindById(string(_id))
	if err != nil {
		return nil, err
	}

	user.Password = nil
	log.Println(_id)

	token, err := helper.GenSessionToken(
		string(_id),
	)
	if err != nil {
		return nil, err
	}

	return &model.UserLoginOrRegisterResponse{
		User:        user,
		AccessToken: *token,
	}, nil
}

// Me is the resolver for the Me field.
func (r *queryResolver) Me(ctx context.Context) (*model.User, error) {
	UserModel, err := user_model.InitUserModel()
	if err != nil {
		return nil, err
	}

	sessionData := ctx.Value(authMiddleware.AuthString("session")).(*session_model.SaveSessionDataOutput)
	user, err := UserModel.FindById(sessionData.UserID.Hex())
	if err != nil {
		return nil, err
	}
	user.Password = nil
	return user, nil
}

// Comics is the resolver for the comics field.
func (r *userResolver) Comics(ctx context.Context, obj *model.User) ([]*model.Comic, error) {
	comicModel, err := comic_model.InitComicModel()
	if err != nil {
		return nil, err
	}
	AllComic := []*model.Comic{}
	for _, v := range obj.ComicIDs {
		data, err := comicModel.FindById(v)
		if err != nil {
			return nil, err
		}
		AllComic = append(AllComic, data)
	}
	return AllComic, nil
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// User returns generated.UserResolver implementation.
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type queryResolver struct{ *Resolver }
type userResolver struct{ *Resolver }
