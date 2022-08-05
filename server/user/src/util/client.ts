import { join as PathJoin } from 'https://deno.land/std@0.149.0/path/mod.ts'
import { config } from 'https://deno.land/x/dotenv@v3.2.0/mod.ts'
import { MongoClient } from 'https://deno.land/x/mongo/mod.ts'

config({
	path: PathJoin(import.meta.url, './../../.env'),
})
export const DB_NAME = Deno.env.get('DB_NAME') || 'users'
const DB_USERNAME = Deno.env.get('DB_USERNAME') || 'root'
const DB_PASSWORD = Deno.env.get('DB_PASSWORD') || 'root'
const DB_HOST = Deno.env.get('DB_HOST') || 'localhost'
const DB_PORT = Deno.env.get('DB_PORT') || '27017'

const client = new MongoClient()
// if (Deno.env.get('DB_PORT')) {
// await client.connect(
// `mongodb://${Deno.env.get('DB_USERNAME') || 'root'}:${
// Deno.env.get('DB_PASSWORD') || 'root'
// }@${Deno.env.get('DB_HOST') || 'localhost'}:${Number(
// Deno.env.get('DB_PORT') || 27017
// )}/?authSource=admin&readPreference=primary&ssl=false`
// )
// } else {
// await client.connect(
// `mongodb+srv://${Deno.env.get('DB_USERNAME') || 'root'}:${
// Deno.env.get('DB_PASSWORD') || 'root'
// }@${
// Deno.env.get('DB_HOST') || 'localhost'
// }/${DB_NAME}?retryWrites=true&w=majority`
// )
// }
//
await client.connect({
	db: DB_NAME,
	tls: false,
	servers: [
		{
			host: DB_HOST,
			port: Number(DB_PORT),
		},
	],
	credential: {
		username: DB_USERNAME,
		password: DB_PASSWORD,
		db: "admin",
		mechanism: 'SCRAM-SHA-256',
	},
})
export default client
