const { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    haiku(id: ID!): Haiku
  }

  type Haiku {
    id: ID!
    lines: [String!]
    author: String
  }
`);

exports.schema = schema;
