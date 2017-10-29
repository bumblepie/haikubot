const { FakeDB } = require('./persistence/fake-db');

const repo = new FakeDB();
// The root provides a resolver function for each API endpoint
const root = {
  getHaiku({ id }) {
    return repo.getHaiku(id);
  },

  createHaiku({ haikuInput }) {
    return repo.createHaiku(haikuInput);
  },

};

exports.root = root;
