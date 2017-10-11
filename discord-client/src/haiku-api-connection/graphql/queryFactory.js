const queries = require('./queries');

exports.createHaikuMutation = haiku => (
  {
    query: queries.createHaikuMutation,
    variables: {
      haiku: {
        author: haiku.author,
        lines: haiku.lines,
      },
    },
  });

exports.getHaikuByIdQuery = haikuId => (
  {
    query: queries.getHaikuByIdQuery,
    variables: {
      haikuId,
    },
  });
