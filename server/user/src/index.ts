import { serve } from 'https://deno.land/std/http/server.ts'
import { GraphQLHTTP } from 'https://deno.land/x/gql/mod.ts'
import { makeExecutableSchema } from 'https://deno.land/x/graphql_tools/mod.ts'
import { resolvers } from './resolvers/index.ts'
import { typeDefs } from './typeDefs/index.ts'




const handler = async (req) => {
	const { pathname } = new URL(req.url)

	return pathname === '/graphql'
		? await GraphQLHTTP<Request>({
				schema: makeExecutableSchema({ resolvers, typeDefs }),
				graphiql: true,
		  })(req)
		: new Response('Not Found', { status: 404 })
}

console.log('Listening on http://localhost:8000/graphql')
serve(handler)
