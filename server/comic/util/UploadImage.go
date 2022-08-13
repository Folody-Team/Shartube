package util

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

type UploadImageResponse struct {
	Url string `json:"url"`
}

func UploadSingleImage(file *io.ReadSeeker) (*string, error) {
	UploadServerUrl := os.Getenv("UploadServer")
	if UploadServerUrl == "" {
		UploadServerUrl = "http://localhost:3000/upload"
	}
	extraParams := map[string]string{}
	req, err := newFileUploadRequest(UploadServerUrl, extraParams, "image", file)
	if err != nil {
		return nil, err
	}
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var response UploadImageResponse
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		return nil, err
	}
	return &response.Url, nil
}

// Creates a new file upload http request with optional extra params
func newFileUploadRequest(uri string, params map[string]string, paramName string, file *io.ReadSeeker) (*http.Request, error) {

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile(paramName, filepath.Base("image"))
	if err != nil {
		return nil, err
	}
	_, err = io.Copy(part, *file)
	if err != nil {
		return nil, err
	}

	for key, val := range params {
		_ = writer.WriteField(key, val)
	}
	err = writer.Close()
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", uri, body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	return req, err
}
