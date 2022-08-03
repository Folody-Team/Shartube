import { ObjectId } from 'https://deno.land/x/mongo@v0.31.0/mod.ts'
import { MongoClient } from 'https://deno.land/x/mongo@v0.31.0/mod.ts'
import {
	create,
	getNumericDate,
	verify,
} from 'https://deno.land/x/djwt@v2.7/mod.ts'

interface SessionType {
	_id: ObjectId
	createdAt: Date
	updatedAt: Date
	userID: ObjectId
}

const key = await crypto.subtle.generateKey(
	{ name: 'HMAC', hash: 'SHA-512' },
	true,
	['sign', 'verify']
)

export async function GenToken(
	client: MongoClient,
	userID: ObjectId,
	DB_NAME: string
) {
	const db = client.database(DB_NAME)
	const session = db.collection<SessionType>('session')
	const timeByMinus = 180
	const expireAfterSeconds = timeByMinus * 60
	const expTime = new Date().getSeconds() + expireAfterSeconds
	session.createIndexes({
		indexes: [
			{
				name: 'createAt',
				key: {
					createAt: 1,
				},
				expireAfterSeconds,
			},
		],
	})
	const sessionID = await session.insertOne({
		createdAt: new Date(expTime),
		updatedAt: new Date(),
		userID: userID,
	})
	const exp = getNumericDate(expTime)
	const jwt = await create(
		{ alg: 'HS512', typ: 'JWT' },
		{
			sessionID: sessionID.toHexString(),
			exp,
		},
		key
	)
	return jwt
}

async function VerifyToken(token: string) {
	return await verify(token, key)
}

export async function DecodeToken(
	token: string,
	client: MongoClient,
	DB_NAME: string
) {
	const payload = await VerifyToken(token)
	const sessionID = payload.sessionID
	const db = client.database(DB_NAME)
	const session = db.collection<SessionType>('session')
	return await session.findOne({
		_id: new ObjectId(`${sessionID}`),
	})
}
