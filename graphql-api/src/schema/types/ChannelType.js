const { GraphQLID, GraphQLObjectType, GraphQLNonNull } = require('graphql');

const ChannelType = new GraphQLObjectType({
  name: 'Channel',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
  }),
});

exports.ChannelType = ChannelType;
