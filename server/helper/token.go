package helper

import (
	"context"
	"time"

	"github.com/Folody-Team/Shartube/database/base_model"
	"github.com/Folody-Team/Shartube/database/session_model"
	"github.com/Folody-Team/Shartube/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const BaseTimeOut = base_model.BaseCURDTimeOut + 60

func GenSessionToken(userId string) (*string, error) {
	SessionModel, err := session_model.InitSessionModel()
	if err != nil {
		return nil, err
	}
	UserObjectId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, err
	}
	SessionModel.DeleteMany(&session_model.SaveSessionDataInput{
		UserID: UserObjectId,
	})

	Session, err := SessionModel.New(&session_model.SaveSessionDataInput{
		UserID: UserObjectId,
	}).Save()
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
