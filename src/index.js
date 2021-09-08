/**
 * Workflow
 * --------
 * Manually adjust your Prisma data model.
 * Migrate your database using the prisma migrate CLI commands we covered. (Re-)generate Prisma Client
 * Use Prisma Client in your application code to access your database.
 */
const { PrismaClient } = require("@prisma/client");
const { ApolloServer } = require("apollo-server");

const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient()

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
  Query: {
    feed: async (parent, args, context, info) => {
      return await context.prisma.link.findMany()
    },
    link: async (parent, args, context, info) => {
      return await context.prisma.link.findUnique({
        where: { 
          id: Number(args.id)
        }
      })
    },
  },
  Mutation: {
    post: async (parent, args, context, info) => {
      const newLink = await context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        },
      })
      return newLink
    },
    update: async (parent, args, context, info) => {
      const updatedLink = await context.prisma.link.update({
        where: {
          id: Number(args.id),
        },
        data: {
          url: args.url,
          description: args.description,
        },
      });
      return updatedLink
    },
    delete: async (parent, args, context, info) => {
      const deletedLink = await context.prisma.link.delete({
        where: {
          id: Number(args.id),
        },
      });
      return deletedLink
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {prisma},
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
