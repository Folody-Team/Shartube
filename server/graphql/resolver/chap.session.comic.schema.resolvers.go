package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/Folody-Team/Shartube/database/comic_chap_model"
	"github.com/Folody-Team/Shartube/database/comic_session_model"
	"github.com/Folody-Team/Shartube/database/session_model"
	"github.com/Folody-Team/Shartube/database/user_model"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/middleware/authMiddleware"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CreatedBy is the resolver for the CreatedBy field.
func (r *comicChapResolver) CreatedBy(ctx context.Context, obj *model.ComicChap) (*model.User, error) {
	userModel, err := user_model.InitUserModel()
	if err != nil {
		return nil, err
	}
	return userModel.FindById(obj.CreatedByID)
}

// Session is the resolver for the Session field.
func (r *comicChapResolver) Session(ctx context.Context, obj *model.ComicChap) (*model.ComicSession, error) {
	comicSessionModel, err := comic_session_model.InitComicSessionModel()
	if err != nil {
		return nil, err
	}
	return comicSessionModel.FindById(obj.SessionID)
}

// CreateComicChap is the resolver for the CreateComicChap field.
func (r *mutationResolver) CreateComicChap(ctx context.Context, input *model.CreateComicChapInput) (*model.ComicChap, error) {
	comicSessionModel, err := comic_session_model.InitComicSessionModel()
	if err != nil {
		return nil, err
	}
	userID := ctx.Value(authMiddleware.AuthString("session")).(*session_model.SaveSessionDataOutput).UserID.Hex()
	userIDObject, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	comicSessionDoc, err := comicSessionModel.FindById(input.SessionID)
	if err != nil {
		return nil, err
	}
	if comicSessionDoc == nil {
		return nil, gqlerror.Errorf("comic session not found")
	}
	if userID != comicSessionDoc.CreatedByID {
		return nil, gqlerror.Errorf("Access Denied")
	}
	comicChapModel, err := comic_chap_model.InitComicChapModel()
	if err != nil {
		return nil, err
	}

	ChapID, err := comicChapModel.New(&model.CreateComicChapInputModel{
		Name:        input.Name,
		Description: input.Description,
		CreatedByID: userIDObject.Hex(),
		SessionID:   input.SessionID,
	}).Save()
	if err != nil {
		return nil, err
	}
	ComicSessionObjectId, err := primitive.ObjectIDFromHex(input.SessionID)
	if err != nil {
		return nil, err
	}

	comicSessionModel.UpdateOne(bson.M{
		"_id": ComicSessionObjectId,
	}, bson.M{
		"$push": bson.M{
			"ChapIds": ChapID,
		},
	})
	return comicChapModel.FindById(ChapID.Hex())
}

// ChapBySession is the resolver for the ChapBySession field.
func (r *queryResolver) ChapBySession(ctx context.Context, sessionID string) ([]*model.ComicChap, error) {
	comicChapModel, err := comic_chap_model.InitComicChapModel()
	if err != nil {
		return nil, err
	}
	return comicChapModel.Find(bson.M{"SessionID": sessionID})
}

// ComicChap returns generated.ComicChapResolver implementation.
func (r *Resolver) ComicChap() generated.ComicChapResolver { return &comicChapResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type comicChapResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
