# Graphql Api
This api provides a way to persist haikus and fetch them from a database.

## Required knowledge & useful links
### node.js
This project is built using nodejs. For useful links on learning the basics of nodejs, see:
 - https://www.airpair.com/javascript/node-js-tutorial

### graphql
This purpose of this project is to expose a graphql api. For useful links on learning the basics of graphql, see:
 - http://graphql.org/learn/
 - http://graphql.org/graphql-js/

## Installation
To install the node_modules dependencies, run `npm i` in the `graphql-api` directory. You may need to run this with root permissions.

## Testing

### Functional testing
To run the tests, use the command `npm test` in the `graphql-api` directory.

This runs two commands:
 - `eslint .` runs a linter which checks coding style. If this prints out nothing, you're good to go otherwise some style changes are necessary.
 - `mocha` runs the mocha tests in the `test` directory.

You should run the tests and ensure there are no errors before making a pull request.

### Testing the api
A useful tool for debugging the api is graphiql. To use it, run the server, and then navigate to `localhost:4000/graphql`. This provides a simple interactive UI for running queries against the api.

## Running
To start the server, run `node server`.

## Project structure
  - example-queries (contains example graphql queries to help show how the api can be used)
  - src (source code for the api)
    - persistence (code relevant to storing data)
    - types (classes representing the domain types such as Haiku)
    - schema.js (the graphql schema)
    - resolvers.js (the graphql resolvers)
    - server.js (code that starts up the server)
  - test (mocha functional tests)
