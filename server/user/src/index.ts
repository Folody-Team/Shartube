import { Server, Handler } from "https://deno.land/std/http/mod.ts";
import { makeExecutableSchema } from "https://deno.land/x/graphql_tools/mod.ts";
import { GraphQLHTTP } from "https://deno.land/x/gql/mod.ts";
import { typeDefs } from "./typeDefs/index.ts";
import { resolvers } from "./resolvers/index.ts";
import { config } from 'https://deno.land/x/dotenv/mod.ts'
import {join as PathJoin} from 'https://deno.land/std/path/mod.ts'

config({
  path: PathJoin(import.meta.url,".env")
})


const handler: Handler = async (req) => {
  const { pathname } = new URL(req.url);

  return pathname === "/graphql"
    ? await GraphQLHTTP<Request>({
        schema: makeExecutableSchema({ resolvers, typeDefs }),
        graphiql: true,
      })(req)
    : new Response("Not Found", { status: 404 });
};
const server = new Server({
  port: 8080,
  handler,
});
server.listenAndServe().then(() => {
  console.log("Server start at http://localhost:8080");
});
