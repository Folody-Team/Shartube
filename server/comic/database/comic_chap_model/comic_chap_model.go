package comic_chap_model

import (
	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/graphql/model"
	"go.mongodb.org/mongo-driver/mongo"
)

func InitComicChapModel(client *mongo.Client) (*base_model.BaseModel[model.CreateComicChapInputModel, model.ComicChap], error) {

	var UserModel = base_model.BaseModel[model.CreateComicChapInputModel, model.ComicChap]{
		BaseModelInitValue: &base_model.BaseModelInitValue{
			Client:         client,
			CollectionName: "comic_chaps",
			Timestamp:      true,
			DeleteAfter:    nil,
		},
	}
	return &UserModel, nil
}
