const queries = require('./queries');

exports.createHaikuMutation = (haiku) => {
  query: queries.createHaikuMutation,
  variables: {
    haiku: {
      author: haiku.author.id,
      lines: haiku.lines,
    }
  }
};
