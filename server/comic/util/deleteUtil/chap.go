package deleteUtil

import (
	"github.com/Folody-Team/Shartube/database/comic_chap_model"
	"github.com/Folody-Team/Shartube/database/comic_session_model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func DeleteChap(id string, client *mongo.Client, update bool) (bool, error) {
	chapModel, err := comic_chap_model.InitComicChapModel(client)
	if err != nil {
		return false, err
	}
	ComicSessionModel, err := comic_session_model.InitComicSessionModel(client)
	if err != nil {
		return false, err
	}

	chap, err := chapModel.FindOneAndDeleteById(id)
	if err != nil {
		return false, err
	}
	if chap == nil {
		return false, nil
	}

	ComicChapObjectID, err := primitive.ObjectIDFromHex(chap.ID)
	if err != nil {
		return false, err
	}
	ComicSessionObjectID, err := primitive.ObjectIDFromHex(chap.SessionID)
	if err != nil {
		return false, err
	}
	if update {
		_, err = ComicSessionModel.UpdateOne(bson.M{
			"_id": ComicSessionObjectID,
		}, bson.M{
			"$pull": bson.M{
				"ChapIds": ComicChapObjectID,
			},
		})
		if err != nil {
			return false, err
		}
	}
	return true, nil
}
