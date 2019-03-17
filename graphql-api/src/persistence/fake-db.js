const { Haiku } = require('../domain/types/Haiku');

class FakeHaikuDB {

  async init() {
    this.haikuMap = {};
    return new Promise((resolve) => {
      resolve();
    });
  }

  /* eslint-disable class-methods-use-this */
  async close() {
    return new Promise((resolve) => {
      resolve();
    });
  }
  /* eslint-enable class-methods-use-this */

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
    return new Promise((resolve, reject) => {
      if (!this.haikuMap[serverId] || !this.haikuMap[serverId][id]) {
        reject(new Error(`No haiku with id ${id} found in server ${serverId}`));
      }
      resolve(new Haiku(id, this.haikuMap[serverId][id]));
    });
  }

  clearHaiku(serverId, id) {
    if (serverId in this.haikuMap) {
      delete this.haikuMap[serverId][id];
    }
  }

  clearAllHaikus() {
    this.haikuMap = {};
  }

  /* eslint-disable class-methods-use-this */
  getChannel(id) {
    return { id };
  }

  getServer(id) {
    return { id };
  }
  /* eslint-enable class-methods-use-this */
}

exports.FakeHaikuDB = FakeHaikuDB;
