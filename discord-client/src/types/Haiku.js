class Haiku {
  constructor(id, { authors, lines, serverId, channelId }) {
    this.id = id;
    this.authors = authors;
    this.lines = lines;
    this.serverId = serverId;
    this.channelId = channelId;
  }
}

exports.Haiku = Haiku;
