package deleteUtil

import (
	"github.com/Folody-Team/Shartube/database/comic_model"
	"github.com/Folody-Team/Shartube/database/comic_session_model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func DeleteSession(id string, client *mongo.Client, update bool) (bool, error) {
	ComicSessionModel, err := comic_session_model.InitComicSessionModel(client)
	if err != nil {
		return false, err
	}
	ComicModel, err := comic_model.InitComicModel(client)
	if err != nil {
		return false, err
	}
	comicSession, err := ComicSessionModel.FindById(id)
	if err != nil {
		return false, err
	}
	if comicSession == nil {
		return false, nil
	}
	ComicSessionObjectId, err := primitive.ObjectIDFromHex(comicSession.ID)
	if err != nil {
		return false, err
	}

	_, err = ComicSessionModel.DeleteOne(bson.M{
		"_id": ComicSessionObjectId,
	})
	if err != nil {
		return false, err
	}
	for _, v := range comicSession.ChapIds {
		_, err = DeleteChap(v, client, false)
		if err != nil {
			return false, err
		}

	}

	if update {
		ComicObjectId, err := primitive.ObjectIDFromHex(comicSession.ComicID)
		if err != nil {
			return false, err
		}

		_, err = ComicModel.UpdateOne(bson.M{
			"_id": ComicObjectId,
		}, bson.M{
			"$pull": bson.M{
				"sessionId": ComicSessionObjectId,
			},
		})
		if err != nil {
			return false, nil
		}
	}

	return true, nil
}
