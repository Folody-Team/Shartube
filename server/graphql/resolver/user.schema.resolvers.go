package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"regexp"

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
func (r *authOpsResolver) Login(ctx context.Context, obj *model.AuthOps, input model.LoginUserInput) (*model.UserLoginOrRegisterResponse, error) {
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
func (r *authOpsResolver) Register(ctx context.Context, obj *model.AuthOps, input model.RegisterUserInput) (*model.UserLoginOrRegisterResponse, error) {
	// contribute by phatdev
	// add detect email format
	email_regex := "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"

	re := regexp.MustCompile(email_regex)
	matches := re.MatchString(input.Email)
	if !matches {
		return nil, gqlerror.Errorf("email format is incorrect")
	}

	apiUrl := "https://isitarealemail.com/api/email/validate?email=" + url.QueryEscape(input.Email)

	req, _ := http.NewRequest("GET", apiUrl, nil)
	res, err := http.DefaultClient.Do(req)

	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)

	if err != nil {
		return nil, err
	}

	var response EmailResponse
	json.Unmarshal(body, &response)

	if response.Status == "invalid" {
		return nil, gqlerror.Errorf("email is invalid")
	}

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
func (r *authQueryResolver) Me(ctx context.Context, obj *model.AuthQuery) (*model.User, error) {
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

// AuthOps returns generated.AuthOpsResolver implementation.
func (r *Resolver) AuthOps() generated.AuthOpsResolver { return &authOpsResolver{r} }

// AuthQuery returns generated.AuthQueryResolver implementation.
func (r *Resolver) AuthQuery() generated.AuthQueryResolver { return &authQueryResolver{r} }

type authOpsResolver struct{ *Resolver }
type authQueryResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//  - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//    it when you're done.
//  - You have helper methods in this file. Move them out to keep these resolver files clean.
type EmailResponse struct {
	Status string `json:"status"`
}
