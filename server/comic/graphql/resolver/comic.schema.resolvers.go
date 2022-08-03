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
	"github.com/sacOO7/gowebsocket"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.mongodb.org/mongo-driver/bson"
)

type WsRequest struct {
	Url     string       `json:"url"`
	Header  *interface{} `json:"header"`
	Payload any          `json:"payload"`
	From    string       `json:"from"`
	Type    string       `json:"message"`
}

// CreatedBy is the resolver for the CreatedBy field.
func (r *comicResolver) CreatedBy(ctx context.Context, obj *model.Comic) (*model.User, error) {

	return util.GetUserByID(obj.CreatedByID)
}

// Session is the resolver for the session field.
func (r *comicResolver) Session(ctx context.Context, obj *model.Comic) ([]*model.ComicSession, error) {
	comicSessionModel, err := comic_session_model.InitComicSessionModel()
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
	comicModel, err := comic_model.InitComicModel()
	if err != nil {
		return nil, err
	}

	userID := ctx.Value(directives.AuthString("session")).(*directives.SessionDataReturn).UserID
	if err != nil {
		return nil, err
	}
	comicID, err := comicModel.New(&model.CreateComicInputModel{
		CreatedByID: userID,
		Name:        input.Name,
		Description: input.Description,
	}).Save()

	if err != nil {
		return nil, err
	}
	// userModel, err := user_model.InitUserModel()
	// if err != nil {
	// 	return nil, err
	// }

	// userModel.UpdateOne(bson.M{
	// 	"_id": userIDObject,
	// }, bson.M{
	// 	"$push": bson.M{
	// 		"ComicIDs": comicID,
	// 	},
	// })
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
	comicModel, err := comic_model.InitComicModel()
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

// Comics is the resolver for the Comics field.
func (r *queryResolver) Comics(ctx context.Context) ([]*model.Comic, error) {
	comicModel, err := comic_model.InitComicModel()
	if err != nil {
		return nil, err
	}

	return comicModel.Find(bson.D{})
}

// Comic returns generated.ComicResolver implementation.
func (r *Resolver) Comic() generated.ComicResolver { return &comicResolver{r} }

type comicResolver struct{ *Resolver }
