function feed (parent, args, context, info) {
  return context.prisma.link.findMany()
}

/*
function link(parent, args, context, info)  {
  return context.prisma.link.findUnique({
    where: {
      id: Number(args.id),
    },
  });
}
*/

/*
  function user(parent, args, context, info) {
    return context.prisma.user.findUnique({
      where: {
        id: Number(args.id),
      },
      include: {
        links: true // all posts where userId === args.id
      }
    })
  }
*/

module.exports = {
  feed,
  // link,
  // user
}