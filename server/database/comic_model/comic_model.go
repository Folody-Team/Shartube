package comic_model

import (
	"log"

	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/util/getClient"
)

func InitComicModel() (*base_model.BaseModel[model.CreateComicInputModel, model.Comic], error) {
	client, err := getClient.GetClient()
	if err != nil {
		log.Println(err)
		return nil, err
	}
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
