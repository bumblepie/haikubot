const { schema } = require('./schema');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { MySqlDB } = require('./persistence/mysql');

const repo = new MySqlDB('haikuDB');
repo.init();
const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
  context: { repo },
}));

app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
