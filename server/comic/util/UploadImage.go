package util

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"os"
)

type UploadImageResponse struct {
	Url string `json:"url"`
}

func UploadSingleImage(file io.ReadSeeker, extension string) (*string, error) {
	UploadServerUrl := os.Getenv("UploadServer")
	if UploadServerUrl == "" {
		UploadServerUrl = "http://localhost:3000/upload"
	}
	// encode file to base64
	base64String := base64.StdEncoding.EncodeToString(ReadAll(file))
	var jsonStr = []byte(`{"fileBase64":"` + base64String + `", "extension":"` + extension + `"}`)
	// send to upload server
	req, err := http.NewRequest("POST", UploadServerUrl, bytes.NewBuffer(jsonStr))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	// get response
	body := UploadImageResponse{}
	err = json.NewDecoder(resp.Body).Decode(&body)
	if err != nil {
		return nil, err
	}
	return &body.Url, nil
}

func ReadAll(r io.Reader) []byte {
	buf := new(bytes.Buffer)
	buf.ReadFrom(r)
	return buf.Bytes()
}
