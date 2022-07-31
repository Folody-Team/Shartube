// deno-lint-ignore-file no-explicit-any
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.0/mod.ts'
import { MongoClient, ObjectId } from 'https://deno.land/x/mongo/mod.ts'
import { GQLError } from 'https://deno.land/x/oak_graphql@0.6.4/mod.ts'
import { emailChecker } from '../function/emailChecker.ts'
import { GenToken } from '../util/Token.ts'

import { join as PathJoin } from 'https://deno.land/std@0.149.0/path/mod.ts'
import { config } from 'https://deno.land/x/dotenv@v3.2.0/mod.ts'
import { TypeDefsString } from '../typeDefs/index.ts'

config({
	path: PathJoin(import.meta.url, './../../.env'),
})
const DB_NAME = Deno.env.get('DB_NAME') || 'users'

const client = new MongoClient()
if (Deno.env.get('DB_PORT')) {
	await client.connect(
		`mongodb://${Deno.env.get('DB_USERNAME') || 'root'}:${
			Deno.env.get('DB_PASSWORD') || 'root'
		}@${Deno.env.get('DB_HOST') || 'localhost'}:${Number(
			Deno.env.get('DB_PORT') || 27017
		)}/?authSource=admin&readPreference=primary&ssl=false`
	)
} else {
	await client.connect(
		`mongodb+srv://${Deno.env.get('DB_USERNAME') || 'root'}:${
			Deno.env.get('DB_PASSWORD') || 'root'
		}@${
			Deno.env.get('DB_HOST') || 'localhost'
		}/${DB_NAME}?retryWrites=true&w=majority`
	)
}
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
	Query: {
		_service: (root: any) => {
			sdl: string
		}
	}
	Mutation: {
		Login: (
			a: any,
			input: {
				input: {
					UsernameOrEmail: string
					password: string
				}
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
	Query: {
		_service: () => {
			const stringResult = TypeDefsString
			return { sdl: stringResult }
		},
	},
	Mutation: {
		async Login(_, args) {
			const db = client.database(DB_NAME)
			const users = db.collection<User>('users')
			const user =
				(await users.findOne({
					email: args.input.UsernameOrEmail,
				})) ||
				(await users.findOne({
					username: args.input.UsernameOrEmail,
				}))
			if (!user) {
				throw new GQLError({
					type: 'email or password or user name is incorrect',
				})
			}
			const IsValidPassword = await bcrypt.compare(
				args.input.password,
				user.password
			)
			if (!IsValidPassword) {
				throw new GQLError({
					type: 'email or password or user name is incorrect',
				})
			}
			user.password = ''
			return {
				accessToken: await GenToken(client, user._id, DB_NAME),
				user: user,
			}
		},
		async Register(_, args) {
			const isEmailValid = await emailChecker(args.input.email)
			console.log(args)
			if (!isEmailValid) {
				throw new GQLError({ type: 'email invalid' })
			}
			const db = client.database(DB_NAME)
			const users = db.collection<User>('users')
			const insertId = await users.insertOne({
				...args.input,
				password: await bcrypt.hash(args.input.password),
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			const returnValue = await users.findOne({
				_id: insertId,
			})
			if (!returnValue) {
				throw new GQLError({ type: 'Server Error' })
			}
			returnValue.password = ''
			return {
				accessToken: await GenToken(client, returnValue._id, DB_NAME),
				user: returnValue,
			}
		},
	},
}
