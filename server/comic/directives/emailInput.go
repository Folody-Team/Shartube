/*
	Here is the explanation for the code above:
		1. Create a new struct EmailResponse
		2. Unmarshal the response body to the response struct
		3. If the response status is invalid, return an error
		4. Return the next resolver
*/

package directives

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"regexp"

	"github.com/99designs/gqlgen/graphql"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

type EmailResponse struct {
	Status string `json:"status"`
}

func EmailInput(ctx context.Context, obj interface{}, next graphql.Resolver) (res interface{}, err error) {
	// this file is written by phatdev and tritranduc
	// write the logic to detect the email error then return
	// the error to the client
	// convert the obj to map string interface{}
	newObj := obj.(map[string]interface{})
	email_regex := "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"

	re := regexp.MustCompile(email_regex)
	matches := re.MatchString(newObj["email"].(string)) // matches is true if the regex matches the string
	if !matches {
		return nil, gqlerror.Errorf("email format is incorrect") // return if the email format is incorrect (mathces is false)
	}

	apiUrl := "https://isitarealemail.com/api/email/validate?email=" + url.QueryEscape(newObj["email"].(string)) // url encode the email

	client := &http.Client{} // create a new http client

	req, err := http.NewRequest(http.MethodGet, apiUrl, nil) // create a new request

	if err != nil {
		log.Println(err)
		return nil, gqlerror.Errorf("email format is incorrect") // return if the email format is incorrect (err is not nil)
	}

	resp, err := client.Do(req) // execute the request

	if err != nil {
		return nil, err // return if error (err is not nil)
	}

	defer resp.Body.Close() // close the response body

	body, err := ioutil.ReadAll(resp.Body) // read the response body

	if err != nil {
		return nil, err // return if error (err is not nil)
	}

	var response EmailResponse      // create a new EmailResponse struct
	json.Unmarshal(body, &response) // unmarshal the response body to the response struct

	if response.Status == "invalid" {
		return nil, gqlerror.Errorf("email is invalid") // return if the email is invalid
	}
	return next(ctx)
}
