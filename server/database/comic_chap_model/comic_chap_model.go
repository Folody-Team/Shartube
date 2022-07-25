package comic_chap_model


import (
	"log"

	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/graphql/model"
	"github.com/Folody-Team/Shartube/util/getClient"
)

func InitComicChapModel() (*base_model.BaseModel[model.CreateComicChapInputModel, model.ComicChap], error) {
	client, err := getClient.GetClient()
	if err != nil {
		log.Println(err)
		return nil, err
	}
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
