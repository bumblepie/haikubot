const { createHaiku, loadHaiku} = require('./persistence/fake-db')

// The root provides a resolver function for each API endpoint
var root = {
  getHaiku: function({id}) {
    return loadHaiku(id);
  },

	createHaiku: function({haiku}) {
		return createHaiku(haiku);
	}

};

exports.root = root;
