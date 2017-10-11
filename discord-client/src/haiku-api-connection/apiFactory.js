const { GraphqlApi } = require('./graphql/api');
exports.createGraphqlApi = baseUrl => new GraphqlApi(baseUrl);
