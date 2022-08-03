package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"net/http"
	"os"

	"github.com/Folody-Team/Shartube/database/comic_model"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/model"
)

// Comics is the resolver for the comics field.
func (r *userResolver) Comics(ctx context.Context, obj *model.User) ([]*model.Comic, error) {
	userHost := os.Getenv("UserHost")
	// make http request to userHost
	getUserPath := "/user/comics?id="
	getUserUrl := "http://" + userHost + ":8080" + getUserPath + obj.ID
	resp, err := http.Get(getUserUrl)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var comicIDs []*string
	err = json.NewDecoder(resp.Body).Decode(&comicIDs)
	if err != nil {
		return nil, err
	}
	comicModel, err := comic_model.InitComicModel()
	if err != nil {
		return nil, err
	}
	AllComic := []*model.Comic{}
	for _, v := range comicIDs {
		if v != nil {
			data, err := comicModel.FindById(*v)
			if err != nil {
				return nil, err
			}
			AllComic = append(AllComic, data)
		}

	}
	return AllComic, nil
}

// User returns generated.UserResolver implementation.
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type userResolver struct{ *Resolver }
