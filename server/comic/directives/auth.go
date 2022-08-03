package directives

import (
	"context"
	"encoding/json"
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
	Type    string       `json:"message"`
}

type PayloadReturn struct {
	SessionData *SessionDataReturn `json:"sessionData"`
	ID          string             `json:"id"`
}

type ReturnData struct {
	Url     string        `json:"url"`
	Header  *interface{}  `json:"header"`
	Payload PayloadReturn `json:"payload"`
	Type    string        `json:"type"`
	Error   *string       `json:"error"`
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
	requestId := uuid.New().String()
	payload := struct {
		Token string `json:"token"`
		ID    string `json:"id"`
	}{
		Token: auth,
		ID:    requestId,
	}
	requestData := WsRequest{
		Url:     "user/decodeToken",
		Header:  nil,
		Payload: &payload,
		From:    "comic/auth",
		Type:    "message",
	}
	requestDataBytes, err := json.Marshal(requestData)
	if err != nil {
		return nil, err
	}
	ws, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return nil, err
	}
	defer ws.Close()
	ws.WriteMessage(websocket.TextMessage, requestDataBytes)

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			return nil, err
		}
		var data ReturnData
		err = json.Unmarshal(message, &data)
		if err != nil {
			return nil, err
		}
		if data.Type == "rep" {
			if data.Payload.ID == requestId {
				if data.Error != nil {
					return nil, &gqlerror.Error{
						Message: "Access Denied",
					}
				}
				if data.Payload.SessionData != nil {
					return next(context.WithValue(ctx, AuthString("session"), data.Payload.SessionData))
				}

				return nil, &gqlerror.Error{
					Message: "Access Denied",
				}

			}
		}
	}

}
