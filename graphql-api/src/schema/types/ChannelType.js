const { GraphQLID, GraphQLObjectType } = require('graphql');

const ChannelType = new GraphQLObjectType({
  name: 'Channel',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
  }),
});

exports.ChannelType = ChannelType;
