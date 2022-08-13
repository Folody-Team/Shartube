import { ApolloServer } from "apollo-server-express";
import express from "express";
import http from "http";
import {
  ApolloGateway,
  GraphQLDataSourceProcessOptions,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from "@apollo/gateway";
import dotenv from "dotenv";
import path from "path";
import { graphqlUploadExpress } from "./util/graphqlUploadExpress";
import multer from "multer";

dotenv.config({
  path: path.join(__dirname, "./.env"),
});

class InspectionDataSource extends RemoteGraphQLDataSource {
  static extractFileVariables(rootVariables: any) {
    Object.values(rootVariables || {}).forEach((value) => {
      if (value instanceof Promise) {
        // this is a file upload!
        console.log(value);
      }
    });
  }

  process(args: GraphQLDataSourceProcessOptions<Record<string, any>>) {
    InspectionDataSource.extractFileVariables(args.request.variables);
    return super.process(args);
  }
}

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
    return new InspectionDataSource({
      url,
      willSendRequest(options) {
        options.request.http?.headers.set(
          "Authorization",
          options.context.token || ""
        );
      },
    });
  },
});
async function startServer() {
  const app = express();
  const HttpServer = http.createServer(app);
  const server = new ApolloServer({
    gateway,
    context: ({ req, res }) => {
      return { req, res, token: req.headers.authorization };
    },
    cache: "bounded",
    plugins: [],
  });
  await server.start();
  app.use(multer().any());
  const graphqlPath = "/graphql";
  app.use(graphqlPath, graphqlUploadExpress());

  server.applyMiddleware({ app, path: graphqlPath });

  HttpServer.listen(port, () => {
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
    );
  })
    .on("error", (err) => {
      console.error(err);
    })
    .on("close", () => {
      console.log("Server closed");
    })
    .on("listening", () => {
      console.log("Server listening");
    });
}
startServer();
