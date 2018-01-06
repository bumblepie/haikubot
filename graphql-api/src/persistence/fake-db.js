const { Haiku } = require('../domain/types/Haiku');

class FakeDB {
  constructor() {
    this.haikuMap = {};
  }

  createHaiku(haikuInput) {
    const { serverId } = haikuInput;

    if (!(serverId in this.haikuMap)) {
      this.haikuMap[serverId] = { count: 0 };
    }
    const id = this.haikuMap[serverId].count;
    this.haikuMap[serverId][id] = {
      id,
      lines: haikuInput.lines,
      authors: haikuInput.authors,
      channel: haikuInput.channelId,
      server: serverId,
    };
    this.haikuMap[serverId].count += 1;
    return this.getHaiku(serverId, id);
  }

  getHaiku(serverId, id) {
    if (!this.haikuMap[serverId] || !this.haikuMap[serverId][id]) {
      throw new Error(`No haiku with id ${id} found in server ${serverId}`);
    }
    return new Haiku(id, this.haikuMap[serverId][id]);
  }

  clearHaiku(serverId, id) {
    if (serverId in this.haikuMap) {
      delete this.haikuMap[serverId][id];
    }
  }

  clearAllHaikus() {
    this.haikuMap = {};
  }

  getChannel(id) {
    return { id };
  }

  getServer(id) {
    return { id };
  }
}

exports.FakeDB = FakeDB;
