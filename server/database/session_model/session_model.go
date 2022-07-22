package session_model

import (
	"log"
	"time"

	"github.com/Folody-Team/Shartube/constraint"
	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/util/getClient"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SaveSessionDataInput struct {
	UserID primitive.ObjectID `json:"userId"`
}

type SaveSessionDataOutput struct {
	ID        string    `json:"_id" bson:"_id"`
	UserID primitive.ObjectID `json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func InitSessionModel() (*base_model.BaseModel[SaveSessionDataInput, SaveSessionDataOutput], error) {
	client, err := getClient.GetClient()
	if err != nil {
		log.Fatalln(err)
		return nil, err
	}
	timeDelete := time.Minute * constraint.BASE_SESSION_BY_MINUTE_TIME
	var SessionModel = base_model.BaseModel[SaveSessionDataInput, SaveSessionDataOutput]{
		BaseModelInitValue: &base_model.BaseModelInitValue{
			Client:         client,
			CollectionName: "session",
			Timestamp:      true,
			DeleteAfter:    &timeDelete,
		},
	}
	return &SessionModel, nil
}
