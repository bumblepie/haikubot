const { GraphQLList, GraphQLInputObjectType, GraphQLString } = require('graphql');

const HaikuInput = new GraphQLInputObjectType({
  name: 'HaikuInput',
  fields: () => ({
    server: {
      type: GraphQLString,
    },
    channel: {
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
