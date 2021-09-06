const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');

/**
 * @typeDefs define the GraphQL schema
 * note: info can never be null
 */
const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf8'
)

/**
 * @resolvers implementation of the GraphQl Schema
 */
let links = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  description: 'Fullstack tutorial for GraphQL'
}]

const findLink = (id) => links.find(link => link.id == id)

/**
 * 
 * @param {*} arg - represents an argument passed into updateLink
 * @param {*} comparator - used to determine if the arg is unique
 * @returns true if arg exists and does not equal comparator
 */
const validUpdateArgument = (arg, comparator) => {
  if (arg && arg !== comparator) 
    return true
  return false
}

/**
 * 
 * @param {*} linkId - id of a Link 
 * @returns index of a link given its id
 */
const getlinkIndex = (linkId) => Number(linkId.split("-")[1]); 

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: () => links,
    link: (parent, args) => findLink(args.id)
  },
  Mutation: {
    post: (parent, args) => {
      let idCount = links.length
      const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url
      }
      links.push(link)
      return link
    },
    updateLink: (parent, args ) => {
      const linkIndex = getlinkIndex(args.id)
      if (validUpdateArgument(args.description, links[linkIndex].description))
        links[linkIndex].description = args.description
      if (validUpdateArgument(args.url, links[linkIndex].url))
        links[linkIndex].url = args.url
      return links[linkIndex]
    },
    deleteLink: (parent, args) => links.splice(getlinkIndex(args.id))[0]
  }
}

/**
 * @typeDefs and @resolvers are bundled to inform server 
 * of what API ops are accepted and resolved. 
 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server
  .listen()
  .then(({ url }) =>
    console.log(`Server is running on ${url}`)
  );