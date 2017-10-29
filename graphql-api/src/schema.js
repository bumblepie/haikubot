const { GraphQLObjectType, GraphQLSchema, GraphQLString } = require('graphql');
const { HaikuType } = require('./schema/types/HaikuType');
const { HaikuInput } = require('./schema/inputs/HaikuInput');

// Define the Query type
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getHaiku: {
      type: HaikuType,
      args: {
        id: { type: GraphQLString }
      },
      resolve: function (_, { id }, context) {
        console.log(id);
        console.log(context);
        return context.repo.getHaiku(id);
      }
    }
  }
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createHaiku: {
      type: HaikuType,
      args: {
        haikuInput: { type: HaikuInput }
      },
      resolve: function (_, { haikuInput }, context) {
        return context.repo.createHaiku(haikuInput);
      }
    }
  }
});

const schema = new GraphQLSchema({query: queryType, mutation: mutationType});

exports.schema = schema;
