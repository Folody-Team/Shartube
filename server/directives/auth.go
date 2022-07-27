package directives

import (
	"context"
	"log"
	"strings"

	"github.com/99designs/gqlgen/graphql"
	"github.com/Folody-Team/Shartube/database/session_model"
	"github.com/Folody-Team/Shartube/middleware/passRequest"
	"github.com/Folody-Team/Shartube/service"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthString string

func Auth(ctx context.Context, _ interface{}, next graphql.Resolver) (interface{}, error) {
	request := passRequest.CtxValue(ctx)
	SessionModel, err := session_model.InitSessionModel()
	if err != nil {
		return nil, err
	}
	auth := request.Header.Get("Authorization")
	if auth == "" {
		return nil, &gqlerror.Error{
			Message: "Access Denied",
		}
	}
	bearer := "Bearer "
	auth = strings.Trim(strings.Replace(auth, bearer, "", -1), " ")
	validate, err := service.JwtValidate(context.Background(), auth)
	if err != nil || !validate.Valid {
		return nil, &gqlerror.Error{
			Message: "Access Denied",
		}
	}
	customClaim, _ := validate.Claims.(*service.JwtCustomClaim)

	sessionObjectId, err := primitive.ObjectIDFromHex(customClaim.ID)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	session, err := SessionModel.FindOne(bson.M{
		"_id": sessionObjectId,
	})
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, &gqlerror.Error{
			Message: "Access Denied",
		}
	}

	NewCtx := context.WithValue(ctx, AuthString("session"), session)

	return next(NewCtx)
}
