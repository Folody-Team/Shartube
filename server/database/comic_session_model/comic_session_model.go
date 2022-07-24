package comic_session_model


import (
	"log"

	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/util/getClient"
)

func InitComicSessionModel() (*base_model.BaseModel[model.CreateComicSessionInputModel, model.ComicSession], error) {
	client, err := getClient.GetClient()
	if err != nil {
		log.Println(err)
		return nil, err
	}
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
