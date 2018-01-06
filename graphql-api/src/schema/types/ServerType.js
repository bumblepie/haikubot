const { GraphQLID, GraphQLObjectType, GraphQLNonNull } = require('graphql');

const ServerType = new GraphQLObjectType({
  name: 'Server',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
  }),
});

exports.ServerType = ServerType;
