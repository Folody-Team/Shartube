package comic_model

import (
	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/graphql/model"
	"go.mongodb.org/mongo-driver/mongo"
)

func InitComicModel(client *mongo.Client) (*base_model.BaseModel[model.CreateComicInputModel, model.Comic], error) {
	var UserModel = base_model.BaseModel[model.CreateComicInputModel, model.Comic]{
		BaseModelInitValue: &base_model.BaseModelInitValue{
			Client:         client,
			CollectionName: "comics",
			Timestamp:      true,
			DeleteAfter:    nil,
		},
	}
	return &UserModel, nil
}
