package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/Folody-Team/Shartube/database/session_model"
	"github.com/Folody-Team/Shartube/database/user_model"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/middleware/authMiddleware"
)

// Auth is the resolver for the auth field.
func (r *mutationResolver) Auth(ctx context.Context) (*model.AuthOps, error) {
	return &model.AuthOps{}, nil
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

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
