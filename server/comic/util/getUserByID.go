package util

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/Folody-Team/Shartube/graphql/model"
)

func GetUserByID(id string) (*model.User, error) {
	userHost := os.Getenv("UserHost")
	// make http request to userHost
	getUserPath := "/user/GetUserById?id="
	getUserUrl := userHost + getUserPath + id
	resp, err := http.Get(getUserUrl)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var user model.User
	err = json.NewDecoder(resp.Body).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
