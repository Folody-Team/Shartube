import { ApolloServer } from 'apollo-server';
const { ApolloGateway } = require('@apollo/gateway');


const gateway = new ApolloGateway();

const server = new ApolloServer({
  gateway,
});

server.listen(2100).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
}).catch(err => {console.error(err)});