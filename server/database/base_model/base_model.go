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
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/x/bsonx"
)

const BaseCURDTimeOut = 60

type BaseModelInitValue struct {
	Client         *mongo.Client
	CollectionName string
	Timestamp      bool
	DeleteAfter    *time.Duration
}

type BaseModel[dt, rdt any] struct {
	*BaseModelInitValue
}

type NewBaseModel[dt any] struct {
	*BaseModelInitValue
	data *dt
}

func (m *BaseModelInitValue) ClearDB() {
}

func (m *BaseModel[dt, rdt]) FindById(ID string) *rdt {
	m.ClearDB()
	ObjectID, err := primitive.ObjectIDFromHex(ID)
	if err != nil {
		log.Fatalln(err)
	}

	dbName := os.Getenv("DB_NAME")
	collection := m.Client.Database(dbName).Collection(m.CollectionName)
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	var dataResult rdt
	err = collection.FindOne(ctx, bson.M{"_id": ObjectID}).Decode(&dataResult)
	if err != nil {
		log.Fatalln(err)
	}
	return &dataResult

}

func (m *BaseModel[dt, rdt]) FindOne(input interface{}) (*rdt, error) {
	m.ClearDB()
	dbName := os.Getenv("DB_NAME")
	collection := m.Client.Database(dbName).Collection(m.CollectionName)
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	var dataResult rdt
	err := collection.FindOne(ctx, input).Decode(&dataResult)
	if err != nil {
		log.Fatalln(err)
		return nil, err
	}
	return &dataResult, nil

}

func (db *BaseModel[dt, rdt]) Find(input interface{}) ([]*rdt, error) {
	db.ClearDB()
	dbName := os.Getenv("DB_NAME")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	collection := db.Client.Database(dbName).Collection(db.CollectionName)
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
	m.ClearDB()
	return &NewBaseModel[dt]{
		data:               input,
		BaseModelInitValue: m.BaseModelInitValue,
	}
}

type DataTimestamp struct {
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (n *NewBaseModel[dt]) Save() (*primitive.ObjectID, error) {
	n.ClearDB()
	dbName := os.Getenv("DB_NAME")
	collection := n.Client.Database(dbName).Collection(n.CollectionName)
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()

	// merge data and metadata
	var m map[string]string
	ja, _ := json.Marshal(n.data)
	json.Unmarshal(ja, &m)
	if n.Timestamp {
		jb, _ := json.Marshal(DataTimestamp{CreatedAt: time.Now(), UpdatedAt: time.Now()})
		json.Unmarshal(jb, &m)
	}
	if n.DeleteAfter != nil {
		index := mongo.IndexModel{
			Keys:    bsonx.Doc{{Key: "created_at", Value: bsonx.Int64(1)}},
			Options: options.Index().SetExpireAfterSeconds(int32((time.Minute * 5).Seconds())),
		}
		_, err := collection.Indexes().CreateOne(context.Background(), index)
		if err != nil {
			log.Fatalln(err)
			return nil, err
		}
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
