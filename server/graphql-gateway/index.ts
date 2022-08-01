import { ApolloServer } from "apollo-server";
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from "@apollo/gateway";
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(__dirname, "./.env"),
});

const port = process.env.PORT;
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      {
        name: "comic",
        url: process.env.COMIC_SERVER_HOST,
      },
      {
        name: "user",
        url: process.env.USER_SERVER_HOST,
      },
    ],
    subgraphHealthCheck: true,
  }),
  buildService(definition) {
    const { url, name } = definition;
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        // pass the headers to the remote server
        request.http?.headers.set("Authorization", context.token || "");
      },
    });
  },
});

const server = new ApolloServer({
  gateway,
  context: ({ req, res }) => {
    return { req, res, token: req.headers.authorization };
  },
});

server
  .listen({ port })
  .then(({ url }) => {
    console.log(`🚀 Gateway ready at ${url}`);
  })
  .catch((err) => {
    console.error(err);
  });
