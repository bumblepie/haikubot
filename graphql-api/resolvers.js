// The root provides a resolver function for each API endpoint
var root = {
  haiku: function({id}) {
    return {
			id: "id",
			lines: ["line1", "line2", "line3"],
			author: "Author"
		};
  },
};

exports.root = root;
