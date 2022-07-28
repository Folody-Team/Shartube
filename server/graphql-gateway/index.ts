import {ApolloServer} from "apollo-server";
import {ApolloGateway, IntrospectAndCompose} from "@apollo/gateway";
import('dotenv').then(modules => modules.config({
  path: (require('path')).join(__dirname, './.env')
})).then(() => {
  const port = process.env.PORT;
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        {
          name: "comic",
          url: process.env.COMIC_SERVER_HOST,
        }
      ]
    })
  });

  const server = new ApolloServer({
    gateway,
  });

  server.listen({port}).then(({ url }) => {
    console.log(`🚀 Gateway ready at ${url}`);
  }).catch((err) => {
    console.error(err);
  });
});