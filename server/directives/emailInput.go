package directives

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
)

func EmailInput(ctx context.Context, obj interface{}, next graphql.Resolver) (res interface{}, err error) {
	// write the logic to detect the email error then return 
	return next(ctx)
}