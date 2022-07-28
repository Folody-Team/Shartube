package user_model

import (
	"log"

	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/util/getClient"
)

func InitUserModel() (*base_model.BaseModel[model.RegisterUserInput, model.User], error) {
	client, err := getClient.GetClient()
	if err != nil {
		log.Println(err)
		return nil, err
	}
	var UserModel = base_model.BaseModel[model.RegisterUserInput, model.User]{
		BaseModelInitValue: &base_model.BaseModelInitValue{
			Client:         client,
			CollectionName: "users",
			Timestamp:      true,
			DeleteAfter:    nil,
		},
	}
	return &UserModel, nil
}
