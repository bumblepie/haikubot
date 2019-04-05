class Haiku {
  constructor(id, {
    authors,
    lines,
    timestamp,
    serverId,
    channelId,
  }) {
    this.id = id;
    this.authors = authors;
    this.lines = lines;
    this.timestamp = timestamp;
    this.serverId = serverId;
    this.channelId = channelId;
  }
}

exports.Haiku = Haiku;
