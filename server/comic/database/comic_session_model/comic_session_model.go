package comic_session_model

import (
	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/graphql/model"
	"go.mongodb.org/mongo-driver/mongo"
)

func InitComicSessionModel(client *mongo.Client) (*base_model.BaseModel[model.CreateComicSessionInputModel, model.ComicSession], error) {

	var UserModel = base_model.BaseModel[model.CreateComicSessionInputModel, model.ComicSession]{
		BaseModelInitValue: &base_model.BaseModelInitValue{
			Client:         client,
			CollectionName: "comic_sessions",
			Timestamp:      true,
			DeleteAfter:    nil,
		},
	}
	return &UserModel, nil
}
