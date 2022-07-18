package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/Folody-Team/Shartube/database/user_model"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/model"
	"go.mongodb.org/mongo-driver/bson"
)

// Login is the resolver for the Login field.
func (r *mutationResolver) Login(ctx context.Context, input model.LoginUserInput) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}

// Register is the resolver for the Register field.
func (r *mutationResolver) Register(ctx context.Context, input model.RegisterUserInput) (*model.User, error) {
	UserModel, err := user_model.InitUserModel()
	if err != nil {
		return nil, err
	}
	id, err := UserModel.New(&input).Save()
	if err != nil {
		return nil, err
	}
	_id := id.Hex()
	user := UserModel.FindById(string(_id))
	return user, nil
}

// Me is the resolver for the Me field.
func (r *queryResolver) Me(ctx context.Context) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}

// Users is the resolver for the Users field.
func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	UserModel, err := user_model.InitUserModel()
	if err != nil {
		return nil, err
	}
	users, err := UserModel.Find(bson.D{})
	if err != nil {
		return nil, err
	}
	for _, v := range users {
		fmt.Println(*v)
	}

	return users, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
