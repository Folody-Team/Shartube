package deleteUtil

import (
	"github.com/Folody-Team/Shartube/database/comic_chap_model"
	"github.com/Folody-Team/Shartube/database/comic_session_model"
	"go.mongodb.org/mongo-driver/bson"
)

func DeleteChap(id string) (bool, error) {
	chapModel, err := comic_chap_model.InitComicChapModel()
	if err != nil {
		return false, err
	}
	ComicSessionModel, err := comic_session_model.InitComicSessionModel()
	if err != nil {
		return false, err
	}

	chap, err := chapModel.FindOneAndDelete(bson.M{
		"_id": id,
	})
	if err != nil {
		return false, err
	}
	_, err = ComicSessionModel.FindOneAndUpdate(bson.M{
		"_id": chap.SessionID,
	}, bson.M{
		"$pull": bson.M{
			"ChapIds": chap.ID,
		},
	})
	if err != nil {
		return false, nil
	}
	return true, nil
}
