const {
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { GraphQLDateTime } = require('graphql-iso-date');
const { ServerType } = require('./ServerType');
const { ChannelType } = require('./ChannelType');

const HaikuType = new GraphQLObjectType({
  name: 'Haiku',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    server: {
      type: ServerType,
      resolve: (haiku, _, context) => context.repo.getServer(haiku.server),
    },
    channel: {
      type: ChannelType,
      resolve: (haiku, _, context) => context.repo.getChannel(haiku.channel),
    },
    timestamp: {
      type: new GraphQLNonNull(GraphQLDateTime),
    },
    lines: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
    },
    authors: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
    },

  }),
});

exports.HaikuType = HaikuType;
