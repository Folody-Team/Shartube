package getClient

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

func GetClient() (*mongo.Client, error) {
	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	dbUrl := ""
	if len(os.Getenv("DB_PORT")) >= 1 {
		dbUrl += os.ExpandEnv("mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:$DB_PORT")
		dbUrl += "/?authSource=admin&readPreference=primary&ssl=false"
	} else {
		dbUrl += os.ExpandEnv("mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}")
		dbUrl += os.ExpandEnv("/${DB_NAME}?retryWrites=true&w=majority")
	}
	clientOptions := options.Client().ApplyURI(dbUrl).
		SetServerAPIOptions(serverAPIOptions)
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	err = client.Ping(ctx, readpref.Primary())

	if err != nil {
		log.Println(err)
		return nil, err
	}
	return client, nil
}
