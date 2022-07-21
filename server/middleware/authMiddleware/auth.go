package authMiddleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/Folody-Team/Shartube/database/session_model"
	"github.com/Folody-Team/Shartube/service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthString string

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		SessionModel, err := session_model.InitSessionModel()
		if err != nil {
			http.Error(w, "server error", http.StatusInternalServerError)
			return
		}
		auth := r.Header.Get("Authorization")
		if auth == "" {
			next.ServeHTTP(w, r)
			return
		}

		bearer := "Bearer "
		auth = strings.Trim(strings.Replace(auth, bearer, "", -1), " ")

		validate, err := service.JwtValidate(context.Background(), auth)
		if err != nil || !validate.Valid {
			http.Error(w, "Invalid token", http.StatusForbidden)
			return
		}

		customClaim, _ := validate.Claims.(*service.JwtCustomClaim)
		

		sessionObjectId, err := primitive.ObjectIDFromHex(customClaim.ID)
		if err != nil {
			log.Fatalln(err)
			http.Error(w, "server error", http.StatusInternalServerError)
			return
		}

		session, err := SessionModel.FindOne(bson.M{
			"_id": sessionObjectId,
		})
		if err != nil {
			http.Error(w, "server error", http.StatusInternalServerError)
			return
		}
		if session == nil {
			http.Error(w, "Invalid token", http.StatusForbidden)
			return
		}

		ctx := context.WithValue(r.Context(), AuthString("session"), session)

		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}

func CtxValue(ctx context.Context) *session_model.SaveSessionDataOutput {
	raw, _ := ctx.Value(AuthString("session")).(*session_model.SaveSessionDataOutput)
	return raw
}
