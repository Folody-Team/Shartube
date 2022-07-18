package base_model

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/mitchellh/mapstructure"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const BaseCURDTimeOut = 60

type BaseModelInitValue struct {
	client         *mongo.Client
	collectionName string
}

type BaseModel[dt, rdt any] struct {
	*BaseModelInitValue
	timestamp bool
}

type NewBaseModel[dt any] struct {
	*BaseModelInitValue
	data      *dt
	timestamp bool
}

func (m *BaseModel[dt, rdt]) FindById(ID string) *rdt {
	ObjectID, err := primitive.ObjectIDFromHex(ID)
	if err != nil {
		log.Fatalln(err)
	}

	dbName := os.Getenv("DB_NAME")
	collection := m.client.Database(dbName).Collection(m.collectionName)
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	var dataResult rdt
	err = collection.FindOne(ctx, bson.M{"_id": ObjectID}).Decode(&dataResult)
	if err != nil {
		log.Fatalln(err)
	}
	return &dataResult

}

func (m *BaseModel[dt, rdt]) FindOne(input interface{}) *rdt {
	dbName := os.Getenv("DB_NAME")
	collection := m.client.Database(dbName).Collection(m.collectionName)
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	var dataResult rdt
	err := collection.FindOne(ctx, input).Decode(&dataResult)
	if err != nil {
		log.Fatalln(err)
	}
	return &dataResult

}

func (db *BaseModel[dt, rdt]) Find(input interface{}) ([]*rdt, error) {
	dbName := os.Getenv("DB_NAME")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	collection := db.client.Database(dbName).Collection(db.collectionName)
	cur, err := collection.Find(ctx, input)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	var users []*rdt
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var user *rdt
		err := cur.Decode(&user)
		if err != nil {
			log.Fatal(err)
			return nil, err
		}
		users = append(users, user)
	}
	if err := cur.Err(); err != nil {
		log.Fatal(err)
		return nil, err
	}
	return users, nil
}

func (m *BaseModel[dt, rdt]) New(input *dt) *NewBaseModel[dt] {
	return &NewBaseModel[dt]{
		data:               input,
		BaseModelInitValue: m.BaseModelInitValue,
		timestamp:          m.timestamp,
	}
}

type DataTimestamp struct {
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (n *NewBaseModel[dt]) Save() (*primitive.ObjectID, error) {
	dbName := os.Getenv("DB_NAME")
	collection := n.client.Database(dbName).Collection(n.collectionName)
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()

	// merge data and metadata
	var m map[string]string
	ja, _ := json.Marshal(n.data)
	json.Unmarshal(ja, &m)
	if n.timestamp {
		jb, _ := json.Marshal(DataTimestamp{CreatedAt: time.Now(), UpdatedAt: time.Now()})
		json.Unmarshal(jb, &m)
	}
	var data interface{}
	mapstructure.Decode(m, &data)

	res, err := collection.InsertOne(ctx, data)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	id := res.InsertedID.(primitive.ObjectID)
	return &id, nil
}

func (m *BaseModel[dt, rdt]) GetModel(client *mongo.Client, collectionName string, timestamp bool) {
	m.BaseModelInitValue = &BaseModelInitValue{
		client:         client,
		collectionName: collectionName,
	}
	m.timestamp = timestamp
}
