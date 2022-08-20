package util

import "strings"

func GetFileExtension(contentType string) string {
	if contentType == "" {
		return ""
	}
	return contentType[strings.LastIndex(contentType, "/")+1:]
}
