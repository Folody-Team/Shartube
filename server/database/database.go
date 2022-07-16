package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/Folody-Team/Shartube/graphql/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DB struct {
	client *mongo.Client
}

const BaseCURDTimeOut = 60

func Connect() *DB {

	client, err := mongo.NewClient(options.Client().ApplyURI(os.ExpandEnv("mongodb://${DB_USERNAME}:${DB_PASSWORD}@$DB_HOST:$DB_PORT/$DB_NAME")))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	return &DB{
		client: client,
	}
}

func (db *DB) Save(input *model.RegisterUserInput) *model.User {
	dbName := os.Getenv("DB_NAME")
	collection := db.client.Database(dbName).Collection("user")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	res, err := collection.InsertOne(ctx, input)
	if err != nil {
		log.Fatalln(err)
	}
	return &model.User{
		ID:       res.InsertedID.(primitive.ObjectID).Hex(),
		Username: input.Username,
		Email:    input.Email,
	}
}

func (db *DB) FindById(ID string) *model.User {
	ObjectID, err := primitive.ObjectIDFromHex(ID)
	if err != nil {
		log.Fatalln(err)
	}

	dbName := os.Getenv("DB_NAME")
	collection := db.client.Database(dbName).Collection("user")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	user := model.User{}
	err = collection.FindOne(ctx, bson.M{"_id": ObjectID}).Decode(&user)
	if err != nil {
		log.Fatalln(err)
	}
	return &user
}

func (db *DB) All() []*model.User {
	dbName := os.Getenv("DB_NAME")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	collection := db.client.Database(dbName).Collection("user")
	cur, err := collection.Find(ctx, bson.D{})
	if err != nil {
		log.Fatal(err)
	}
	var users []*model.User
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var user *model.User
		err := cur.Decode(&user)
		if err != nil {
			log.Fatal(err)
		}
		users = append(users, user)
	}
	if err := cur.Err(); err != nil {
		log.Fatal(err)
	}
	return users
}
