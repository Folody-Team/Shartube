package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/Folody-Team/Shartube/database/comic_model"
	"github.com/Folody-Team/Shartube/database/session_model"
	"github.com/Folody-Team/Shartube/database/user_model"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/middleware/authMiddleware"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CreatedBy is the resolver for the CreatedBy field.
func (r *comicResolver) CreatedBy(ctx context.Context, obj *model.Comic) (*model.User, error) {
	userModel, err := user_model.InitUserModel()
	if err != nil {
		return nil, err
	}
	return userModel.FindById(obj.CreatedByID)
}

// CreateComic is the resolver for the createComic field.
func (r *mutationResolver) CreateComic(ctx context.Context, input *model.CreateComicInput) (*model.Comic, error) {
	comicModel, err := comic_model.InitComicModel()
	if err != nil {
		return nil, err
	}

	userID := ctx.Value(authMiddleware.AuthString("session")).(*session_model.SaveSessionDataOutput).UserID.Hex()
	comicID, err := comicModel.New(&model.CreateComicInputModel{
		CreatedByID: userID,
		Name:        input.Name,
		Description: input.Description,
	}).Save()

	if err != nil {
		return nil, err
	}
	userIDObject, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	userModel, err := user_model.InitUserModel()
	if err != nil {
		return nil, err
	}

	userModel.UpdateOne(bson.M{
		"_id": userIDObject,
	}, bson.M{
		"$push": bson.M{
			"ComicIDs": comicID,
		},
	})

	return comicModel.FindById(comicID.Hex())
}

// Comic returns generated.ComicResolver implementation.
func (r *Resolver) Comic() generated.ComicResolver { return &comicResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

type comicResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
