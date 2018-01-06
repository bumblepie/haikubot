const { GraphQLList, GraphQLInputObjectType, GraphQLString } = require('graphql');

const HaikuInput = new GraphQLInputObjectType({
  name: 'HaikuInput',
  fields: () => ({
    serverId: {
      type: GraphQLString,
    },
    channelId: {
      type: GraphQLString,
    },
    lines: {
      type: new GraphQLList(GraphQLString),
    },
    authors: {
      type: new GraphQLList(GraphQLString),
    },
  }),
});

exports.HaikuInput = HaikuInput;
