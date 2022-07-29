// deno-lint-ignore-file no-explicit-any
import { MongoClient, ObjectId } from 'https://deno.land/x/mongo@v0.31.0/mod.ts'

const DB_NAME = Deno.env.get('DB_NAME') || 'users'

const client = new MongoClient()
await client.connect({
	db: Deno.env.get('DB_NAME') || 'users',
	tls: true,
	servers: [
		{
			host: Deno.env.get('DB_HOST') || 'localhost',
			port: Number(Deno.env.get('DB_PORT') || 27017),
		},
	],
	credential: {
		username: Deno.env.get('DB_USERNAME') || 'root',
		password: Deno.env.get('DB_PASSWORD') || 'root',
		db: Deno.env.get('DB_NAME') || 'users',
		mechanism: 'SCRAM-SHA-1',
	},
})
interface User {
	_id: ObjectId
	username: string
	email: string
	password: string
	createdAt: Date
	updatedAt: Date
}
interface UserLoginOrRegisterResponse {
	user: User
	accessToken: string
}
interface IResolvers {
	Mutation: {
		Login: (
			a: any,
			input: {
				UsernameOrEmail: string
				password: string
			}
		) => PromiseOrType<UserLoginOrRegisterResponse>
		Register: (
			parter: any,
			input: {
				input: {
					email: string
					password: string
					username: string
				}
			}
		) => PromiseOrType<UserLoginOrRegisterResponse>
	}
}

type PromiseOrType<type> = Promise<type> | type

export const resolvers: IResolvers = {
	Mutation: {
		Login(_, args) {
			console.log(args)
		},
		async Register(_, args) {
			// email validate
			const db = client.database(DB_NAME)
			const users = db.collection<User>('users')
			const insertId = await users.insertOne({
				username: args.input.username,
				password: args.input.password,
				email: args.input.email,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			const returnValue = await users.findOne({
				_id: insertId,
			})
			if (!returnValue) {
				throw new Error("have the error")
			}
			returnValue.password = ""
		},
	},
}
