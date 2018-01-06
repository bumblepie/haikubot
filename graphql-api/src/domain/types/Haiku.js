class Haiku {
  constructor(id, {
    lines,
    authors,
    channel,
    server,
  }) {
    this.id = id;
    this.lines = lines;
    this.authors = authors;
    this.channel = channel;
    this.server = server;
  }
}

exports.Haiku = Haiku;
