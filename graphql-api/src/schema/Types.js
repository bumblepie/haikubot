const {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');
const { GraphQLDateTime } = require('graphql-iso-date');

let ServerType;
let ChannelType;

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

ServerType = new GraphQLObjectType({
  name: 'Server',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
  }),
});

ChannelType = new GraphQLObjectType({
  name: 'Channel',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
  }),
});

exports.HaikuType = HaikuType;
exports.ServerType = ServerType;
exports.ChannelType = ChannelType;
