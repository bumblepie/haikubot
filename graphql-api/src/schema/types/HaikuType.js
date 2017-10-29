const { GraphQLList, GraphQLObjectType, GraphQLString } = require('graphql')
const { ServerType } = require('./ServerType')
const { ChannelType } = require('./ChannelType')

const HaikuType = new GraphQLObjectType({
  name: 'Haiku',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    server: {
      type: ServerType,
      resolve: (haiku, _, context) => {
        console.log(haiku);
        console.log(context);
        return context.repo.getServer(haiku.server)
      }
    },
    channel: {
      type: ChannelType,
      resolve: (haiku, _, context) => context.repo.getChannel(haiku.channel)
    },
    lines: {
      type: new GraphQLList(GraphQLString)
    },
    authors: {
      type: new GraphQLList(GraphQLString)
    }
  })
});

exports.HaikuType = HaikuType
