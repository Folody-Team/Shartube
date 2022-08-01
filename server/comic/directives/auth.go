package directives

import (
	"context"
	"encoding/json"
	"log"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/Folody-Team/Shartube/middleware/passRequest"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

type AuthString string

type SessionDataReturn struct {
	ID        string    `json:"_id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	UserID    string    `json:"userID"`
}

type WsRequest struct {
	Url     string       `json:"url"`
	Header  *interface{} `json:"header"`
	Payload any          `json:"payload"`
	From    string       `json:"from"`
}

func Auth(ctx context.Context, _ interface{}, next graphql.Resolver) (interface{}, error) {
	request := passRequest.CtxValue(ctx)

	auth := request.Header.Get("Authorization")
	if auth == "" {
		return nil, &gqlerror.Error{
			Message: "Access Denied",
		}
	}
	bearer := "Bearer "
	auth = strings.Trim(strings.Replace(auth, bearer, "", -1), " ")
	u := url.URL{
		Scheme: "ws",
		Host:   os.Getenv("WS_HOST") + ":" + os.Getenv("WS_PORT"),
		Path:   "/",
	}
	log.Println(u.String())
	connect, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	log.Println(auth)
	payload := struct {
		Token string `json:"token"`
		ID    string `json:"id"`
	}{
		Token: auth,
		ID:    uuid.New().String(),
	}
	requestData := WsRequest{
		Url:     "user/decodeToken",
		Header:  nil,
		Payload: &payload,
		From:    "comic/auth",
	}
	SendByte, err := json.Marshal(requestData)
	if err != nil {
		return nil, err
	}

	err = connect.WriteMessage(websocket.TextMessage, SendByte)
	if err != nil {
		return nil, &gqlerror.Error{
			Message: "Access Denied",
		}
	}

	NewCtx := context.WithValue(ctx, AuthString("session"), &SessionDataReturn{
		ID:        "hljlejlkajlfkaj",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		UserID:    "akljflkajfkljakl",
	})

	return next(NewCtx)
}
