import { ApolloServer } from "apollo-server";
import { ApolloGateway } from "@apollo/gateway";
import dotenv from "dotenv"
import path from "path"
dotenv.config({
  path: path.join(__dirname,".env")
})
const gateway = new ApolloGateway({
  serviceList: [
    {
      name: "comic",
      url: process.env.COMIC_SERVER_HOST,
    },
  ],
});

const server = new ApolloServer({
  gateway,
});

server
  .listen(process.env.PORT)
  .then(({ url }) => {
    console.log(`🚀 Gateway ready at ${url}`);
  })
  .catch((err) => {
    console.error(err);
  });
