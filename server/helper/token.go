package helper

import (
	"context"
	"time"

	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/database/session_model"
	"github.com/Folody-Team/Shartube/service"
	"go.mongodb.org/mongo-driver/bson"
)

const BaseTimeOut = base_model.BaseCURDTimeOut + 60

func GenSessionToken(input *session_model.SaveSessionDataInput) (*string, error) {
	SessionModel, err := session_model.InitSessionModel()
	if err != nil {
		return nil, err
	}
	SessionModel.DeleteMany(bson.M{
		"userId": input.UserID,
	})
	Session, err := SessionModel.New(input).Save()
	if err != nil {
		return nil, err
	}
	SessionID := Session.Hex()
	ctx, cancel := context.WithTimeout(context.Background(), BaseTimeOut*time.Second)
	defer cancel()
	accessToken, err := service.JwtGenerate(ctx, SessionID)

	if err != nil {
		return nil, err
	}
	return &accessToken, nil
}
