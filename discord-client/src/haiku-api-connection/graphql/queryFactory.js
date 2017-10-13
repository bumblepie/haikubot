const queries = require('./queries');

exports.createHaikuMutation = haiku => (
  {
    query: queries.createHaikuMutation,
    variables: {
      haiku: {
        authors: haiku.authors,
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
