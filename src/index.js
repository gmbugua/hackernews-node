// GRAPH QL | APOLLO | SUBSCRIPTION
const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { PubSub } = require("graphql-subscriptions");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");

// RESOLVERS
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const Subscription = require("./resolvers/Subscription");
const User = require("./resolvers/User");
const Link = require("./resolvers/Link");
const Vote = require("./resolvers/Vote");

// FILE I/O
const fs = require("fs");
const path = require("path");


// UTILITY
const { getUserId } = require("./utils");


(async () => {

  const prisma = new PrismaClient();
  
  const PORT = 4040;
  const pubsub = new PubSub();
  
  const app = express();
  const httpServer = createServer(app);
  
  
  /**
   * @typeDefs define the GraphQL schema
   * note: info can never be null
   */
  const schemaFileName = "schema.graphql"
  const typeDefs = fs.readFileSync(
    path.join(__dirname, schemaFileName),
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
    Link,
    Vote
  };

  const schema = makeExecutableSchema({typeDefs, resolvers})
  
  /**
   * Attach the HTTP req that carries the incoming GraphQL query or
   * mutation to the context
   * 
   * Allows resolvers to read the AuthHeader and validate if the user 
   * that submitted the request is eligible to perform the op
   */
  const server = new ApolloServer({
    schema, 
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

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: async (connectionParams, webSocket, context) => {
        if (connectionParams.Authorization) {
          return {
            pubsub,
            userId: getUserId(undefined, connectionParams.Authorization),
          };
        }
        throw new Error("Missing auth token!");
      },
      onDisconnect(webSocket, context) {
        console.log("Subscription Server Disconnected! ❌");
      },
    },
    { 
      server: httpServer, 
      path: server.graphqlPath 
    }
  );

  await server.start()

  server.applyMiddleware({ app })

  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Query endpoint running @ http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscription endpoint running @ ws://localhost:${PORT}${server.graphqlPath}`
    );
  });

})();
