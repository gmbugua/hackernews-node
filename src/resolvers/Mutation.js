const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require("../utils");

async function signup(parent, args, context, info) {
  // encrypt the users password
  const password = await bcrypt.hash(args.password, 10);

  // store a new user in db using prisma instance
  const user = await context.prisma.user.create({
    data: { ...args, password },
  });

  /**
   * Generate JSON Web token signed w/ an APP_SECRET
   * defines a compact, self-contained method of secure 
   * info transmission between parties as a JSON Object
   */
  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  // return token and user in a shape that adheres to AuthPayload
  return {
    token,
    user,
  };
}

async function login(parent, args, context, info) {

  // retrieve an existing user record by email
  const user = await context.prisma.user.findUnique({
    where: { email: args.email },
  });
  if (!user) {
    throw new Error("No such user found");
  }

  // validate the provided password with the one in the db
  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
}

async function postLink(parent, args, context, info) {
  const { userId } = context;

  const newLink = context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } },
    },
  });

  context.pubsub.publish("NEW_LINK", newLink)

  return newLink
}

async function vote(parent, args, context, info) {
  const { userId } = context

  const vote = await context.prisma.vote.findUnique({
    where: {
      linkId_userId: {
        linkId: Number(args.linkId),
        userId: userId
      }
    }
  })

  if (Boolean(vote)) {
    throw new Error(`Already voted for the link: ${args.linkId}`)
  }

  const newVote = context.prisma.vote.create({
    data: {
      user: { connect: { id: userId }},
      link: { connect: { id: Number(args.linkId) } }
    }
  })

  context.pubsub.publish("NEW_VOTE", newVote)

  return newVote
}


async function updateLink(parent, args, context, info) {
  const { userId } = context

  const user = await context.prisma.link.findUnique({
    where: {
      id: Number(args.id)
    }
  }).postedBy()

  if (user.id === userId) {
    const updatedLink = await context.prisma.link.update({
      where: {
        id: Number(args.id),
      },
      data: {
        url: args.url,
        description: args.description,
      },
    });

    return updatedLink;
  }

  throw new Error(
    `Cannot update link. Currently authenticated user's userId:${userId} does 
    not match link postedById: ${user.id}.`
  );
  
}

async function deleteLink(parent, args, context, info) {
  const { userId } = context;

  const user = await context.prisma.link.findUnique({
      where: {
        id: Number(args.id),
      },
    }).postedBy();

  if (user.id === userId) {
    const deletedLink = await context.prisma.link.delete({
      where: {
        id: Number(args.id),
      },
    });

    return deletedLink
  }

  throw new Error(
    `Cannot delete link. Currently authenticated user's userId:${userId} does 
    not match link postedById: ${user.id}.`
  );

}

module.exports = {
  signup,
  login,
  postLink,
  vote,
  updateLink,
  deleteLink
};
