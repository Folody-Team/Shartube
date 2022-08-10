package base_model

import (
	"context"
	"log"
	"os"
	"time"

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

func (m *BaseModel[dt, rdt]) FindById(ID string) (*rdt, error) {
	m.ClearDB()
	ObjectID, err := primitive.ObjectIDFromHex(ID)
	if err != nil {
		return nil, err
	}

	dbName := os.Getenv("DB_NAME")
	collection := m.Client.Database(dbName).Collection(m.CollectionName)
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	var dataResult rdt
	err = collection.FindOne(ctx, bson.M{"_id": ObjectID}).Decode(&dataResult)
	if err != nil {
		return nil, err
	}
	return &dataResult, nil

}

func (m *BaseModel[dt, rdt]) FindOne(input interface{}) (*rdt, error) {
	m.ClearDB()
	dbName := os.Getenv("DB_NAME")
	collection := m.Client.Database(dbName).Collection(m.CollectionName)
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	var dataResult rdt
	res := collection.FindOne(ctx, input)
	err := res.Decode(&dataResult)
	if err != nil {
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
		log.Println(err)
		return nil, err
	}
	var users []*rdt
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var user *rdt
		err := cur.Decode(&user)
		if err != nil {
			log.Println(err)
			return nil, err
		}
		users = append(users, user)
	}
	if err := cur.Err(); err != nil {
		log.Println(err)
		return nil, err
	}
	return users, nil
}

func (b *BaseModel[dt, rdt]) DeleteOne(input interface{}) (*mongo.DeleteResult, error) {
	b.ClearDB()
	dbName := os.Getenv("DB_NAME")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	collection := b.Client.Database(dbName).Collection(b.CollectionName)
	result, err := collection.DeleteOne(ctx, input)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func (b *BaseModel[dt, rdt]) UpdateOne(filter interface{}, value any) (*mongo.UpdateResult, error) {
	b.ClearDB()
	dbName := os.Getenv("DB_NAME")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	collection := b.Client.Database(dbName).Collection(b.CollectionName)
	result, err := collection.UpdateOne(ctx, filter, value)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func (b *BaseModel[dt, rdt]) UpdateMany(filter interface{}, value any) (*mongo.UpdateResult, error) {
	b.ClearDB()
	dbName := os.Getenv("DB_NAME")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	collection := b.Client.Database(dbName).Collection(b.CollectionName)
	result, err := collection.UpdateMany(ctx, filter, value)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func (b *BaseModel[dt, rdt]) FindOneAndUpdate(filter interface{}, value any, opts ...*options.FindOneAndUpdateOptions) (*rdt, error) {
	b.ClearDB()
	dbName := os.Getenv("DB_NAME")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	collection := b.Client.Database(dbName).Collection(b.CollectionName)
	var result rdt
	err := collection.FindOneAndUpdate(ctx, filter, value).Decode(&result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}
func (b *BaseModel[dt, rdt]) FindOneAndDelete(filter interface{}, opts ...*options.FindOneAndDeleteOptions) (*rdt, error) {
	b.ClearDB()
	dbName := os.Getenv("DB_NAME")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	collection := b.Client.Database(dbName).Collection(b.CollectionName)
	var result rdt
	err := collection.FindOneAndDelete(ctx, filter).Decode(&result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}
func (b *BaseModel[dt, rdt]) FindOneAndDeleteById(id string, opts ...*options.FindOneAndDeleteOptions) (*rdt, error) {
	b.ClearDB()
	ObjectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	dbName := os.Getenv("DB_NAME")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	collection := b.Client.Database(dbName).Collection(b.CollectionName)
	var result rdt
	err = collection.FindOneAndDelete(ctx, bson.M{
		"_id": ObjectId,
	}).Decode(&result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}
func (b *BaseModel[dt, rdt]) DeleteMany(input interface{}) (*mongo.DeleteResult, error) {
	b.ClearDB()
	dbName := os.Getenv("DB_NAME")
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()
	collection := b.Client.Database(dbName).Collection(b.CollectionName)
	result, err := collection.DeleteMany(ctx, input)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (m *BaseModel[dt, rdt]) New(input *dt) *NewBaseModel[dt] {
	m.ClearDB()
	return &NewBaseModel[dt]{
		data:               input,
		BaseModelInitValue: m.BaseModelInitValue,
	}
}

func (n *NewBaseModel[dt]) Save() (*primitive.ObjectID, error) {
	n.ClearDB()
	dbName := os.Getenv("DB_NAME")
	collection := n.Client.Database(dbName).Collection(n.CollectionName)
	ctx, cancel := context.WithTimeout(context.Background(), BaseCURDTimeOut*time.Second)
	defer cancel()

	// merge data and metadata
	MetaDataArr := []string{"createdAt", "updatedAt"}
	if n.DeleteAfter != nil {
		seconds := int32(n.DeleteAfter.Seconds())
		sessionTTL := mongo.IndexModel{
			Keys:    bson.D{{Key: MetaDataArr[0], Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(seconds),
		}
		_, err := collection.Indexes().CreateOne(ctx, sessionTTL)
		if err != nil {
			return nil, err
		}
	}
	data, err := toDoc(n.data)
	if err != nil {
		return nil, err
	}
	for _, v := range MetaDataArr {
		data = append(data, bsonx.Elem{
			Key:   v,
			Value: bsonx.Time(time.Now()),
		})
	}

	res, err := collection.InsertOne(ctx, data)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	id := res.InsertedID.(primitive.ObjectID)
	return &id, nil
}

func toDoc(v interface{}) (doc bsonx.Doc, err error) {
	data, err := bson.Marshal(v)
	if err != nil {
		return
	}

	err = bson.Unmarshal(data, &doc)
	return
}
