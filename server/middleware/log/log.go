package log

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/99designs/gqlgen/graphql"
)

func LogMiddleware(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
	if len(os.Getenv("MUST_LOG")) <= 0 {
		return next(ctx)
	}
	oc := graphql.GetOperationContext(ctx)

	log.Println("have a ", strings.Replace(oc.RawQuery, "\n", "", -1))
	return next(ctx)
}
