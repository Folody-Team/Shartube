package passRequest

import (
	"context"
	"net/http"
)

type PassString string

func PassMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), PassString("request"), r)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}

func CtxValue(ctx context.Context) *http.Request {
	raw, _ := ctx.Value(PassString("request")).(*http.Request)
	return raw
}
