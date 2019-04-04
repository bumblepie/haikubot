class Haiku {
  constructor(id, {
    lines,
    authors,
    timestamp,
    channel,
    server,
  }) {
    this.id = id;
    this.lines = lines;
    this.authors = authors;
    this.timestamp = timestamp;
    this.channel = channel;
    this.server = server;
  }
}

exports.Haiku = Haiku;
