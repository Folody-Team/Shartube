// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"time"
)

type CreateComic interface {
	IsCreateComic()
}

type Comic struct {
	ID          string    `json:"_id" bson:"_id"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	CreatedBy   *User     `json:"CreatedBy"`
	CreatedByID string    `json:"CreatedByID"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
}

func (Comic) IsCreateComic() {}

type CreateComicInput struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type CreateComicInputModel struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	CreatedByID string  `json:"CreatedByID"`
}

func (CreateComicInputModel) IsCreateComic() {}

type LoginUserInput struct {
	UsernameOrEmail string `json:"UsernameOrEmail"`
	Password        string `json:"password"`
}

type RegisterUserInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type User struct {
	ID        string    `json:"_id" bson:"_id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  *string   `json:"password"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Comics    []*Comic  `json:"comics"`
	ComicIDs  []string  `json:"comicIDs"`
}

type UserLoginOrRegisterResponse struct {
	User        *User  `json:"user"`
	AccessToken string `json:"accessToken"`
}

type UserModelInput struct {
	ID        string    `json:"_id" bson:"_id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  *string   `json:"password"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	ComicIDs  []string  `json:"comicIDs"`
}
