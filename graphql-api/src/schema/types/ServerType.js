const { GraphQLID, GraphQLObjectType } = require('graphql');

const ServerType = new GraphQLObjectType({
  name: 'Server',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
  }),
});

exports.ServerType = ServerType;
