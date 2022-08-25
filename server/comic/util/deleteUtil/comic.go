package deleteUtil

import (
	"github.com/Folody-Team/Shartube/database/comic_model"
	"github.com/Folody-Team/Shartube/database/comic_session_model"
	"go.mongodb.org/mongo-driver/mongo"
)

func DeleteComic(id string, client *mongo.Client) (bool, error) {
	ComicSessionModel, err := comic_session_model.InitComicSessionModel(client)
	if err != nil {
		return false, err
	}
	ComicModel, err := comic_model.InitComicModel(client)
	if err != nil {
		return false, err
	}
	ComicData, err := ComicModel.FindById(id)
	if err != nil {
		return false, err
	}
	if ComicData == nil {
		return false, nil
	}
	for _, sessionID := range ComicData.SessionID {
		ComicSessionData, err := ComicSessionModel.FindById(sessionID)
		if err != nil {
			return false, err
		}
		for _, ChapID := range ComicSessionData.ChapIds {
			_, err = DeleteChap(ChapID, client, false)
			if err != nil {
				return false, err
			}
		}
		DeleteSession(sessionID, client, false)
	}
	_, err = ComicModel.FindOneAndDeleteById(id)
	if err != nil {
		return false, err
	}
	return true, nil
}
