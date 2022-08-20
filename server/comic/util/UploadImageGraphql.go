package util

import (
	"github.com/99designs/gqlgen/graphql"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func UploadImageForGraphql(file graphql.Upload) (*string, error) {
	allowType := []string{
		"image/bmp",
		"image/gif",
		"image/jpeg",
		"image/png",
	}
	// check file type
	if !InSlice(allowType, file.ContentType) {
		return nil, gqlerror.Errorf("file type not allow")
	}
	// check file size only allow 7MB
	if file.Size > 7000000 {
		return nil, gqlerror.Errorf("file size too large")
	}
	FileExtension := GetFileExtension(file.ContentType)
	url, err := UploadSingleImage(file.File, FileExtension)
	if err != nil {
		return nil, err
	}
	return url, nil
}
