const { schema } = require('./schema');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const Repo = require('./persistence/repo');

const repo = Repo.newHaikuRepository();
repo.init().then(() => {
  const app = express();

  app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
    context: { repo },
  }));

  app.listen(4000);
  console.log('Running a GraphQL API server at localhost:4000/graphql');
});
