package deleteUtil

import (
	"github.com/Folody-Team/Shartube/database/comic_chap_model"
	"github.com/Folody-Team/Shartube/database/comic_model"
	"github.com/Folody-Team/Shartube/database/comic_session_model"
	"go.mongodb.org/mongo-driver/bson"
)

func DeleteSession(id string) (bool, error) {
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

	comicSession, err := ComicSessionModel.FindOneAndDelete(bson.M{
		"_id": id,
	})
	if err != nil {
		return false, err
	}

	for _, v := range comicSession.ChapIds {
		_, err = ComicChapModel.FindOneAndDelete(bson.M{
			"_id": v,
		})
		if err != nil {
			return false, err
		}
	}
	_, err = ComicModel.FindOneAndUpdate(bson.M{
		"_id": comicSession.ComicID,
	}, bson.M{
		"$pull": bson.M{
			"sessionId": comicSession.ID,
		},
	})
	if err != nil {
		return false, nil
	}

	return true, nil
}
