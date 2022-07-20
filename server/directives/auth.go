package directives

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/Folody-Team/Shartube/middleware/authMiddleware"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func Auth(ctx context.Context, _ interface{}, next graphql.Resolver) (interface{}, error) {
	tokenData := authMiddleware.CtxValue(ctx)
	if tokenData == nil {
		return nil, &gqlerror.Error{
			Message: "Access Denied",
		}
	}

	return next(ctx)
}