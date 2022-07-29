package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"io"
	"os"
	"path"

	"github.com/Folody-Team/Shartube/database/comic_chap_model"
	"github.com/Folody-Team/Shartube/database/comic_session_model"
	"github.com/Folody-Team/Shartube/database/session_model"
	"github.com/Folody-Team/Shartube/database/user_model"
	"github.com/Folody-Team/Shartube/directives"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/util"
	"github.com/google/uuid"
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
func (r *mutationResolver) CreateComicChap(ctx context.Context, input model.CreateComicChapInput) (*model.ComicChap, error) {
	comicSessionModel, err := comic_session_model.InitComicSessionModel()
	if err != nil {
		return nil, err
	}
	userID := ctx.Value(directives.AuthString("session")).(*session_model.SaveSessionDataOutput).UserID.Hex()
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

// AddImageToChap is the resolver for the AddImageToChap field.
func (r *mutationResolver) AddImageToChap(ctx context.Context, req []*model.UploadFile, chapID string) (*model.ComicChap, error) {
	comicChapModel, err := comic_chap_model.InitComicChapModel()
	if err != nil {
		return nil, err
	}

	userID := ctx.Value(directives.AuthString("session")).(*session_model.SaveSessionDataOutput).UserID.Hex()
	if err != nil {
		return nil, err
	}
	comicChapDoc, err := comicChapModel.FindOne(bson.D{
		{Key: "_id", Value: chapID},
	})
	if err != nil {
		return nil, err
	}
	if comicChapDoc == nil {
		return nil, gqlerror.Errorf("comic chap not found")
	}
	if userID != comicChapDoc.CreatedByID {
		return nil, gqlerror.Errorf("Access Denied")
	}
	allowType := []string{
		"image/bmp",
		"image/gif",
		"image/jpeg", "image/png",
	}
	AllImages := comicChapDoc.Images
	for _, v := range req {
		// check file type
		if !util.InSlice(allowType, v.File.ContentType) {
			return nil, gqlerror.Errorf("file type not allow")
		}
		// check file size
		if v.File.Size > 10*1024*1024 {
			return nil, gqlerror.Errorf("file size too large")
		}
		// save file
		FileId := uuid.New().String()
		fileName := FileId + "." + v.File.ContentType[6:]
		FilePath := path.Join("public/image", fileName)
		// open file
		file, err := os.Create(FilePath)
		if err != nil {
			return nil, err
		}
		// write file
		_, err = io.Copy(file, v.File.File)
		if err != nil {
			return nil, err
		}
		// close file
		err = file.Close()
		if err != nil {
			return nil, err
		}
		AllImages = append(AllImages, &model.ImageResult{
			ID:  FileId,
			URL: path.Join("/public/image", fileName),
		})
	}

	if _, err := comicChapModel.FindOneAndDelete(bson.M{
		"_id": comicChapDoc.ID,
	}, bson.M{
		"Images": AllImages,
	}); err != nil {
		return nil, err
	}

	return comicChapModel.FindById(comicChapDoc.ID)
}

// UpdateComicChap is the resolver for the updateComicChap field.
func (r *mutationResolver) UpdateComicChap(ctx context.Context, chapID string, input model.UpdateComicChapInput) (*model.ComicChap, error) {
	comicChapModel, err := comic_chap_model.InitComicChapModel()
	if err != nil {
		return nil, err
	}
	comicChap, err := comicChapModel.FindById(chapID)
	userID := ctx.Value(directives.AuthString("session")).(*session_model.SaveSessionDataOutput).UserID.Hex()

	if err != nil {
		return nil, err
	}
	if comicChap == nil {
		return nil, &gqlerror.Error{
			Message: "comic chap not found",
		}
	}
	if userID != comicChap.CreatedByID {
		return nil, gqlerror.Errorf("Access Denied")
	}
	return comicChapModel.FindOneAndUpdate(bson.M{
		"_id": comicChap.ID,
	}, input)
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
