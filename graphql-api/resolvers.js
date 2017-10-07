const { createHaiku, loadHaiku } = require('./persistence/fake-db');

// The root provides a resolver function for each API endpoint
const root = {
  getHaiku({ id }) {
    return loadHaiku(id);
  },

  createHaiku({ haiku }) {
    return createHaiku(haiku);
  },

};

exports.root = root;
