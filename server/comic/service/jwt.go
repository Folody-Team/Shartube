package service

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/Folody-Team/Shartube/constraint"
	"github.com/dgrijalva/jwt-go"
	"github.com/joho/godotenv"
)

type JwtCustomClaim struct {
	ID string `json:"id"`
	jwt.StandardClaims
}

var jwtKey = []byte(getJwtSecret())

func getJwtSecret() string {
	defaultSecret := "aSecret"
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
		return defaultSecret
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return defaultSecret
	}

	return secret
}

func JwtGenerate(_ context.Context, SessionID string) (string, error) {
	claims := &JwtCustomClaim{
		ID: SessionID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Minute * constraint.BASE_SESSION_BY_MINUTE_TIME).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := t.SignedString(jwtKey)
	if err != nil {
		return "", err
	}

	return token, nil
}

func JwtValidate(ctx context.Context, token string) (*jwt.Token, error) {
	tk := &JwtCustomClaim{}
	return jwt.ParseWithClaims(token, tk, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	
}
