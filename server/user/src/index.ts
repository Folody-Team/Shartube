import { join as PathJoin } from 'https://deno.land/std@0.149.0/path/mod.ts'
import { config } from 'https://deno.land/x/dotenv@v3.2.0/mod.ts'
import { ObjectId } from 'https://deno.land/x/mongo/mod.ts'
import { Application, Router } from 'https://deno.land/x/oak/mod.ts'
import { applyGraphQL } from 'https://deno.land/x/oak_graphql/mod.ts'
import { resolvers, User } from './resolvers/index.ts'
import { typeDefs } from './typeDefs/index.ts'
import client, { DB_NAME } from './util/client.ts'

config({
	path: PathJoin(import.meta.url,"..", '.env'),
})

const app = new Application()

app.use(async (ctx, next) => {
	await next()
	const rt = ctx.response.headers.get('X-Response-Time')
	console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`)
})
app.use(async (ctx, next) => {
	const start = Date.now()
	await next()
	const ms = Date.now() - start
	ctx.response.headers.set('X-Response-Time', `${ms}ms`)
})

// endpoint for get user info by id
app.use(async (ctx, next) => {
	if (ctx.request.url.pathname == '/user/comics') {
		const id = ctx.request.url.searchParams.get('id')
		if (!id) {
			ctx.response.status = 400
			ctx.response.body = 'id is required'
			return
		}
		const db = client.database(DB_NAME)
		const users = db.collection<User>('users')
		const user = await users.findOne({
			_id: new ObjectId(id),
		})
		ctx.response.body = user?.comicIDs
	}
	// get header token
	const token = ctx.request.headers.get('authorization')

	await next()
})

const GraphQLService = await applyGraphQL<Router>({
	Router,
	typeDefs: typeDefs,
	resolvers: resolvers,
	context: (ctx) => {
		// this line is for passing a user context for the auth
		return { request: ctx.request }
	},
})

app.use(GraphQLService.routes(), GraphQLService.allowedMethods())

console.log('Server start at http://localhost:8080')
await app.listen({ port: 8080 })
