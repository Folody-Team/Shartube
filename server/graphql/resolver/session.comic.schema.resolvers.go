package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/Folody-Team/Shartube/database/comic_chap_model"
	"github.com/Folody-Team/Shartube/database/comic_model"
	"github.com/Folody-Team/Shartube/database/comic_session_model"
	"github.com/Folody-Team/Shartube/database/session_model"
	"github.com/Folody-Team/Shartube/database/user_model"
	"github.com/Folody-Team/Shartube/directives"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CreatedBy is the resolver for the CreatedBy field.
func (r *comicSessionResolver) CreatedBy(ctx context.Context, obj *model.ComicSession) (*model.User, error) {
	userModel, err := user_model.InitUserModel()
	if err != nil {
		return nil, err
	}
	return userModel.FindById(obj.CreatedByID)
}

// Comic is the resolver for the Comic field.
func (r *comicSessionResolver) Comic(ctx context.Context, obj *model.ComicSession) (*model.Comic, error) {
	comicModel, err := comic_model.InitComicModel()
	if err != nil {
		return nil, err
	}
	return comicModel.FindById(obj.ComicID)
}

// Chaps is the resolver for the Chaps field.
func (r *comicSessionResolver) Chaps(ctx context.Context, obj *model.ComicSession) ([]*model.ComicChap, error) {
	comicChapModel, err := comic_chap_model.InitComicChapModel()
	if err != nil {
		return nil, err
	}
	AllChaps := []*model.ComicChap{}
	for _, ChapId := range obj.ChapIds {
		data, err := comicChapModel.FindById(ChapId)
		if err != nil {
			return nil, err
		}
		AllChaps = append(AllChaps, data)
	}
	return AllChaps, nil
}

// CreateComicSession is the resolver for the CreateComicSession field.
func (r *mutationResolver) CreateComicSession(ctx context.Context, input model.CreateComicSessionInput) (*model.ComicSession, error) {
	comicSessionModel, err := comic_session_model.InitComicSessionModel()
	if err != nil {
		return nil, err
	}
	comicModel, err := comic_model.InitComicModel()
	if err != nil {
		return nil, err
	}
	userID := ctx.Value(directives.AuthString("session")).(*session_model.SaveSessionDataOutput).UserID.Hex()
	userIDObject, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	comicDoc, err := comicModel.FindById(input.ComicID)
	if err != nil {
		return nil, err
	}
	if comicDoc == nil {
		return nil, gqlerror.Errorf("comic not found")
	}
	if userID != comicDoc.CreatedByID {
		return nil, gqlerror.Errorf("Access Denied")
	}
	sessionID, err := comicSessionModel.New(&model.CreateComicSessionInputModel{
		Name:        input.Name,
		Description: input.Description,
		CreatedByID: userIDObject.Hex(),
		ComicID:     input.ComicID,
	}).Save()
	if err != nil {
		return nil, err
	}
	ComicObjectId, err := primitive.ObjectIDFromHex(input.ComicID)
	if err != nil {
		return nil, err
	}

	comicModel.UpdateOne(bson.M{
		"_id": ComicObjectId,
	}, bson.M{
		"$push": bson.M{
			"sessionId": sessionID,
		},
	})
	return comicSessionModel.FindById(sessionID.Hex())
}

// SessionByComic is the resolver for the SessionByComic field.
func (r *queryResolver) SessionByComic(ctx context.Context, comicID string) ([]*model.ComicSession, error) {
	comicSessionModel, err := comic_session_model.InitComicSessionModel()
	if err != nil {
		return nil, err
	}
	return comicSessionModel.Find(bson.M{"ComicID": comicID})
}

// ComicSession returns generated.ComicSessionResolver implementation.
func (r *Resolver) ComicSession() generated.ComicSessionResolver { return &comicSessionResolver{r} }

type comicSessionResolver struct{ *Resolver }
