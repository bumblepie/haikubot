const queries = require('./queries');

exports.createHaikuMutation = (haiku) => {
  return {
    query: queries.createHaikuMutation,
    variables: {
      haiku: {
        author: haiku.author,
        lines: haiku.lines,
      }
    }
  }
};
