function links(parent, args, context) {
  return context.prisma.user.findUnique({ 
    where: { id: parent.id } 
  }).links();
}

function votes(parent, args, context, info) {
  return context.prisma.user
    .findUnique({
      where: { id: parent.id },
    })
    .votes();
}

module.exports = {
  links,
  votes
};
