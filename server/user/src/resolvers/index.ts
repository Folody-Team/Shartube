// deno-lint-ignore-file no-explicit-any
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.0/mod.ts'
import { ObjectId } from 'https://deno.land/x/mongo/mod.ts'
import { GQLError } from 'https://deno.land/x/oak_graphql@0.6.4/mod.ts'
import { emailChecker } from '../function/emailChecker.ts'
import { GenToken, DecodeToken } from '../util/Token.ts'

import { join as PathJoin } from 'https://deno.land/std@0.149.0/path/mod.ts'
import { config } from 'https://deno.land/x/dotenv@v3.2.0/mod.ts'
import { TypeDefsString } from '../typeDefs/index.ts'
import client from '../util/client.ts'

config({
	path: PathJoin(import.meta.url, './../../.env'),
})
const DB_NAME = Deno.env.get('DB_NAME') || 'users'

const ws = new WebSocket(
	`ws://${Deno.env.get('WS_HOST')}:${Deno.env.get('WS_PORT')}`
)

ws.onopen = () => console.log('connect to ws success')
ws.onmessage = async (message: MessageEvent<any>) => {
	const data = JSON.parse(message.data)
	if (data.url == 'user/decodeToken') {
		let result
		try {
			const decodeData = await DecodeToken(data.payload.token, client, DB_NAME)
			result = {
				url: data.from,
				header: null,
				payload: {
					sessionData: decodeData,
					id: data.payload.id,
				},
				type: 'rep',
				error: null,
			}
		} catch (error) {
			result = {
				url: data.from,
				header: null,
				payload: {
					sessionData: null,
					id: data.payload.id,
				},
				type: 'rep',
				error: error.message,
			}
		}

		ws.send(JSON.stringify(result))
	}
	if (data.url == 'user/GetUserById') {
		let result
		try {
			const db = client.database(DB_NAME)
			const users = db.collection<User>('users')
			const user = await users.findOne({
				_id: new ObjectId(data.payload.userID),
			})
			result = {
				url: data.from,
				header: null,
				payload: {
					user: user,
					id: data.payload.id,
				},
				type: 'rep',
				error: null,
			}
		} catch (error) {
			result = {
				url: data.from,
				header: null,
				payload: {
					user: null,
					id: data.payload.id,
				},
				type: 'rep',
				error: error.message,
			}
		}

		ws.send(JSON.stringify(result))
	}
	if (data.url == 'user/updateUserComic') {
		let result
		try {
			const db = client.database(DB_NAME)
			const users = db.collection<User>('users')
			await users.updateOne(
				{
					_id: new ObjectId(data.payload.UserID),
				},
				{
					$push: {
						comicIDs: new ObjectId(data.payload._id),
					},
				}
			)
			result = {
				url: data.from,
				header: null,
				payload: {
					user: await users.findOne({
						_id: new ObjectId(data.payload.UserID),
					}),
					id: data.payload.id,
				},
				type: 'rep',
				error: null,
			}
		} catch (error) {
			result = {
				url: data.from,
				header: null,
				payload: {
					user: null,
					id: data.payload.id,
				},
				type: 'rep',
				error: error.message,
			}
		}
		ws.send(JSON.stringify(result))
	}
	if (data.url == 'user/DeleteComic') {
		let result
		try {
			const db = client.database(DB_NAME)
			const users = db.collection<User>('users')
			await users.updateOne(
				{
					_id: new ObjectId(data.payload.UserID),
				},
				{
					$pull: {
						comicIDs: new ObjectId(data.payload._id),
					},
				}
			)
			result = {
				url: data.from,
				header: null,
				payload: {
					user: await users.findOne({
						_id: new ObjectId(data.payload.UserID),
					}),
					id: data.payload.id,
				},
				type: 'rep',
				error: null,
			}
		} catch (error) {
			result = {
				url: data.from,
				header: null,
				payload: {
					user: null,
					id: data.payload.id,
				},
				type: 'rep',
				error: error.message,
			}
		}
		ws.send(JSON.stringify(result))
	}
}

export interface User {
	_id: ObjectId
	username: string
	email: string
	password: string
	createdAt: Date
	updatedAt: Date
	comicIDs: ObjectId[]
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
		_entities: (root: any, args: any) => Promise<any[]>
		Me(root: any, args: any, context: any, info: any): Promise<User>
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
	User: {
		__resolveReference: (reference: any) => PromiseOrType<User | undefined>
	}
}

type PromiseOrType<type> = Promise<type> | type
export const resolvers: IResolvers = {
	Query: {
		_service: () => {
			const stringResult = TypeDefsString
			return { sdl: stringResult }
		},
		_entities: async (root: any, args: any) => {
			const returnValue = []
			for (const data of args.representations) {
				const TypeObj = root[data.__typename as string]
				const result = await TypeObj.__resolveReference(data)
				returnValue.push({
					...data,
					...result,
				})
			}
			return returnValue
		},
		Me: async (root: any, args: any, context: any, ...rest: any[]) => {
			if (!context.request.headers.get('authorization')) {
				throw new GQLError({
					type: 'Unauthorized',
					message: 'You are not authorized to access this resource',
				})
			}
			const UserSession = await DecodeToken(
				context.request.headers.get('authorization').replace('Bearer ', ''),
				client,
				DB_NAME
			)
			if (!UserSession) {
				throw new GQLError({
					type: 'Unauthorized',
					message: 'You are not authorized to access this resource',
				})
			}
			const db = client.database(DB_NAME)
			const users = db.collection<User>('users')
			return {
				...(await users.findOne({
					_id: new ObjectId(UserSession.userID),
				})),
				password: '',
			}
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
			// const isEmailValid = await emailChecker(args.input.email)
			console.log(args.input.email)
			// if (!isEmailValid) {
			// throw new GQLError({ type: 'email invalid' })
			// }
			const db = client.database(DB_NAME)
			const users = db.collection<User>('users')

			const user =
                (await users.findOne({
                    email: args.input.email,
                })) ||
                (await users.findOne({
                    username: args.input.username,
                }))
			
            if (user) {
                throw new GQLError({
                    type: 'username is already taken',
                })
            }

			const insertId = await users.insertOne({
				...args.input,
				password: await bcrypt.hash(args.input.password),
				createdAt: new Date(),
				updatedAt: new Date(),
				comicIDs: [],
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
	User: {
		__resolveReference: async (reference) => {
			const db = client.database(DB_NAME)
			const users = db.collection<User>('users')
			const user = await users.findOne({
				_id: new ObjectId(reference._id),
			})
			return user
		},
	},
}
