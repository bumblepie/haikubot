const {
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');

const HaikuInput = new GraphQLInputObjectType({
  name: 'HaikuInput',
  fields: () => ({
    serverId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    channelId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    lines: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
    },
    authors: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
    },
  }),
});

exports.HaikuInput = HaikuInput;
