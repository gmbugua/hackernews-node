function feed (parent, args, context, info) {
  return context.prisma.link.findMany()
}

function link(parent, args, context, info)  {
  return context.prisma.link.findUnique({
    where: {
      id: Number(args.id),
    }
  });
}

function user(parent, args, context, info) {
  return context.prisma.user.findUnique({
    where: {
      email: args.email,
    }
  })
}

module.exports = {
  feed,
  link,
  user
}