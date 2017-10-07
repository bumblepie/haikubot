const { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    getHaiku(id: ID!): Haiku
  }

  type Mutation {
    createHaiku(haiku: HaikuInput): Haiku
  }

  type Haiku {
    id: ID!
    lines: [String!]
    author: String
  }

  input HaikuInput {
    lines: [String!]
    author: String
  }
`);

exports.schema = schema;
