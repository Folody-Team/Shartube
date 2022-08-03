package deleteUtil

import (
	"github.com/Folody-Team/Shartube/database/comic_chap_model"
	"github.com/Folody-Team/Shartube/database/comic_model"
	"github.com/Folody-Team/Shartube/database/comic_session_model"
	"go.mongodb.org/mongo-driver/bson"
)

func DeleteComic(id string) (bool, error) {
	ComicSessionModel, err := comic_session_model.InitComicSessionModel()
	if err != nil {
		return false, err
	}
	ComicChapModel, err := comic_chap_model.InitComicChapModel()
	if err != nil {
		return false, err
	}
	ComicModel, err := comic_model.InitComicModel()
	if err != nil {
		return false, err
	}
	ComicData, err := ComicModel.FindOneAndDelete(bson.M{"_id": id})
	if err != nil {
		return false, err
	}
	for _, sessionID := range ComicData.SessionID {
		ComicSessionData, err := ComicSessionModel.FindOneAndDelete(bson.M{
			"_id": sessionID,
		})
		if err != nil {
			return false, err
		}
		for _, ChapID := range ComicSessionData.ChapIds {
			_, err = ComicChapModel.FindOneAndDelete(bson.M{"_id": ChapID})
			if err != nil {
				return false, err
			}
		}
	}
	return true, nil
}
