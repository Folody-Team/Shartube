import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import multer from "multer";
import path from "path";
import FileUploadDataSource from "./util/FileUploadDataSource";
import { graphqlUploadExpress } from "./util/graphqlUploadExpress";

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
    return new FileUploadDataSource({
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
  app.use(graphqlUploadExpress());

  server.applyMiddleware({ app });

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
