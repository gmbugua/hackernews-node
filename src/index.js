// GRAPH QL | APOLLO | SUBSCRIPTION
const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { PubSub } = require("graphql-subscriptions");
const { SubscriptionServer } = require("subscriptions-transport-ws");

// RESOLVERS
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const Subscription = require("./resolvers/Subscription");
const User = require("./resolvers/User");
const Link = require("./resolvers/Link");

// FILE I/O
const fs = require("fs");
const path = require("path");

// UTILITY
const { getUserId } = require("./utils");


const prisma = new PrismaClient();
const PORT = 4040;
const pubsub = new PubSub();
const app = express();
const httpServer = createServer(app);


/**
 * @typeDefs define the GraphQL schema
 * note: info can never be null
 */
const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

/**
 * @resolvers implementation of the GraphQl Schema
 */
const resolvers = {
  Query, 
  Mutation,
  Subscription,
  User,
  Link
};

/**
 * Attach the HTTP req that carries the incoming GraphQL query or
 * mutation to the context
 * 
 * Allows resolvers to read the AuthHeader and validate if the user 
 * that submitted the request is eligible to perform the op
 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      prisma,
      pubsub,
      userId: req && req.headers.authorization 
                ? getUserId(req) 
                : null
    };
  },
});

server.applyMiddleware({ app })

server.listen().then(({ url }) => {
  console.log(`Server is running on ${url}`)
});

SubscriptionServer.create(
  { schema, execute, subscribe },
  { server: httpServer, path: server.graphqlPath }
);

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
  );
});
