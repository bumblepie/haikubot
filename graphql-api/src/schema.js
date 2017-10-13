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
    authors: [String!]
  }

  input HaikuInput {
    lines: [String!]
    authors: [String!]
  }
`);

exports.schema = schema;
