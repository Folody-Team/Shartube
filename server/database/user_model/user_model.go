package user_model

import (
	"log"

	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/util/getClient"
)

var UserModel = base_model.BaseModel[model.RegisterUserInput, model.User]{}

func InitUserModel() (*base_model.BaseModel[model.RegisterUserInput, model.User], error) {
	client, err := getClient.GetClient()
	if err != nil {
		log.Println(err)
		return nil, err
	}
	UserModel.GetModel(client, "users",true)
	return &UserModel, nil
}
