const {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} = require('graphql');
const { HaikuType, ServerType } = require('./schema/Types');
const { HaikuInput } = require('./schema/inputs/HaikuInput');

// Define the Query type
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getHaiku: {
      type: HaikuType,
      args: {
        serverId: { type: new GraphQLNonNull(GraphQLString) },
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, { serverId, id }, context) => context.repo.getHaiku(serverId, id),
    },

    searchHaikus: {
      type: new GraphQLList(HaikuType),
      args: {
        serverId: { type: new GraphQLNonNull(GraphQLString) },
        keywords: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
      },
      // eslint-disable-next-line max-len
      resolve: (_, { serverId, keywords }, context) => context.repo.searchHaikus(serverId, keywords),
    },

    getServer: {
      type: ServerType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, { id }) => ({ id }),
    },
  },
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createHaiku: {
      type: HaikuType,
      args: {
        haikuInput: { type: HaikuInput },
      },
      resolve: (_, { haikuInput }, context) => context.repo.createHaiku(haikuInput),
    },
    deleteHaiku: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        serverId: { type: new GraphQLNonNull(GraphQLString) },
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { serverId, id }, context) => {
        await context.repo.clearHaiku(serverId, id);
        return true;
      },
    },
  },
});

const schema = new GraphQLSchema({ query: queryType, mutation: mutationType });

exports.schema = schema;
