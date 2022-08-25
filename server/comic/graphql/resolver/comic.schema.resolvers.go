package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"log"
	"net/url"
	"os"

	"github.com/Folody-Team/Shartube/database/comic_model"
	"github.com/Folody-Team/Shartube/database/comic_session_model"
	"github.com/Folody-Team/Shartube/directives"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/util"
	"github.com/Folody-Team/Shartube/util/deleteUtil"
	"github.com/sacOO7/gowebsocket"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.mongodb.org/mongo-driver/bson"
)

// CreatedBy is the resolver for the CreatedBy field.
func (r *comicResolver) CreatedBy(ctx context.Context, obj *model.Comic) (*model.User, error) {
	return util.GetUserByID(obj.CreatedByID)
}

// Session is the resolver for the session field.
func (r *comicResolver) Session(ctx context.Context, obj *model.Comic) ([]*model.ComicSession, error) {
	comicSessionModel, err := comic_session_model.InitComicSessionModel(r.Client)
	if err != nil {
		return nil, err
	}
	AllComicSession := []*model.ComicSession{}
	for _, v := range obj.SessionID {
		data, err := comicSessionModel.FindById(v)
		if err != nil {
			return nil, err
		}
		AllComicSession = append(AllComicSession, data)
	}
	return AllComicSession, nil
}

// CreateComic is the resolver for the createComic field.
func (r *mutationResolver) CreateComic(ctx context.Context, input model.CreateComicInput) (*model.Comic, error) {
	comicModel, err := comic_model.InitComicModel(r.Client)
	if err != nil {
		return nil, err
	}

	userID := ctx.Value(directives.AuthString("session")).(*directives.SessionDataReturn).UserID
	if err != nil {
		return nil, err
	}
	ThumbnailUrl := ""
	if input.Thumbnail != nil {
		ThumbnailUrlPointer, err := util.UploadImageForGraphql(*input.Thumbnail)
		if err != nil {
			return nil, err
		}
		ThumbnailUrl = *ThumbnailUrlPointer
	}
	comicID, err := comicModel.New(&model.CreateComicInputModel{
		CreatedByID: userID,
		Name:        input.Name,
		Description: input.Description,
		Thumbnail:   &ThumbnailUrl,
	}).Save()

	if err != nil {
		return nil, err
	}

	// get data from comic model
	u := url.URL{
		Scheme: "ws",
		Host:   os.Getenv("WS_HOST") + ":" + os.Getenv("WS_PORT"),
		Path:   "/",
	}
	socket := gowebsocket.New(u.String())

	socket.OnConnected = func(socket gowebsocket.Socket) {
		log.Println("Connected to server")
	}

	socket.OnTextMessage = func(message string, socket gowebsocket.Socket) {
		log.Println("Got messages " + message)
	}

	socket.Connect()

	if err != nil {
		return nil, err
	}

	comicObjectData := WsRequest{
		Url:    "user/updateUserComic",
		Header: nil,
		Payload: bson.M{
			"_id":    comicID.Hex(),
			"UserID": userID,
		},
		From: "comic/createComic",
		Type: "message",
	}

	comicObject, err := json.Marshal(comicObjectData)
	if err != nil {
		return nil, err
	}
	comicObjectString := string(comicObject)
	socket.SendText(comicObjectString)

	socket.Close()
	return comicModel.FindById(comicID.Hex())
}

// UpdateComic is the resolver for the updateComic field.
func (r *mutationResolver) UpdateComic(ctx context.Context, comicID string, input model.UpdateComicInput) (*model.Comic, error) {
	comicModel, err := comic_model.InitComicModel(r.Client)
	if err != nil {
		return nil, err
	}
	userID := ctx.Value(directives.AuthString("session")).(*directives.SessionDataReturn).UserID

	comic, err := comicModel.FindById(comicID)
	if err != nil {
		return nil, err
	}
	if comic == nil {
		return nil, &gqlerror.Error{
			Message: "comic not found",
		}
	}
	if comic.CreatedByID != userID {
		return nil, &gqlerror.Error{
			Message: "Access Denied",
		}
	}

	return comicModel.FindOneAndUpdate(bson.M{
		"_id": comic.ID,
	}, input)
}

// DeleteComic is the resolver for the DeleteComic field.
func (r *mutationResolver) DeleteComic(ctx context.Context, comicID string) (*model.DeleteResult, error) {
	ComicModel, err := comic_model.InitComicModel(r.Client)
	if err != nil {
		return nil, err
	}
	userID := ctx.Value(directives.AuthString("session")).(*directives.SessionDataReturn).UserID
	ComicData, err := ComicModel.FindById(comicID)
	if err != nil {
		return nil, err
	}
	if ComicData == nil {
		return nil, &gqlerror.Error{
			Message: "comic not found",
		}
	}
	if ComicData.CreatedByID != userID {
		return nil, &gqlerror.Error{
			Message: "Access Denied",
		}
	}
	success, err := deleteUtil.DeleteComic(comicID, r.Client)
	if err != nil {
		return nil, err
	}
	u := url.URL{
		Scheme: "ws",
		Host:   os.Getenv("WS_HOST") + ":" + os.Getenv("WS_PORT"),
		Path:   "/",
	}
	socket := gowebsocket.New(u.String())

	socket.OnConnected = func(socket gowebsocket.Socket) {
		log.Println("Connected to server")
	}

	socket.OnTextMessage = func(message string, socket gowebsocket.Socket) {
		log.Println("Got messages " + message)
	}

	socket.Connect()

	if err != nil {
		return nil, err
	}

	comicObjectData := WsRequest{
		Url:    "user/DeleteComic",
		Header: nil,
		Payload: bson.M{
			"_id":    comicID,
			"UserID": userID,
		},
		From: "comic/createComic",
		Type: "message",
	}

	comicObject, err := json.Marshal(comicObjectData)
	if err != nil {
		return nil, err
	}
	comicObjectString := string(comicObject)
	socket.SendText(comicObjectString)

	socket.Close()

	// send to user service to pull comic
	return &model.DeleteResult{
		Success: success,
		ID:      ComicData.ID,
	}, nil
}

// Comics is the resolver for the Comics field.
func (r *queryResolver) Comics(ctx context.Context) ([]*model.Comic, error) {
	comicModel, err := comic_model.InitComicModel(r.Client)
	if err != nil {
		return nil, err
	}

	return comicModel.Find(bson.D{})
}

// Comic returns generated.ComicResolver implementation.
func (r *Resolver) Comic() generated.ComicResolver { return &comicResolver{r} }

type comicResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//   - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//     it when you're done.
//   - You have helper methods in this file. Move them out to keep these resolver files clean.
type WsRequest struct {
	Url     string       `json:"url"`
	Header  *interface{} `json:"header"`
	Payload any          `json:"payload"`
	From    string       `json:"from"`
	Type    string       `json:"message"`
}
