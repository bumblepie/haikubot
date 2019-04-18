const { Haiku } = require('../domain/types/Haiku');
const { validateKeywords } = require('./common');

class FakeHaikuDB {
  async init() {
    this.haikuMap = {};
    this.count = 0;
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
    const id = this.count;
    this.haikuMap[id] = {
      id,
      lines: haikuInput.lines,
      authors: haikuInput.authors,
      timestamp: new Date(),
      channel: haikuInput.channelId,
      server: haikuInput.serverId,
    };
    this.count += 1;
    return this.getHaiku(haikuInput.serverId, id);
  }

  getHaiku(serverId, id) {
    return new Promise((resolve, reject) => {
      if (!this.haikuMap[id] || this.haikuMap[id].server !== serverId) {
        reject(new Error(`No haiku with id ${id} found in server ${serverId}`));
      }
      resolve(new Haiku(id, this.haikuMap[id]));
    });
  }

  clearHaiku(serverId, id) {
    if (id in this.haikuMap && this.haikuMap[id].server === serverId) {
      delete this.haikuMap[id];
    }
  }

  clearAllHaikus() {
    this.haikuMap = {};
  }

  searchHaikus(keywords) {
    return new Promise((resolve, reject) => {
      validateKeywords(keywords);
      const lowercaseKeywords = keywords.map(keyword => keyword.toLowerCase());
      const result = Object.values(this.haikuMap)
        .filter(haiku => {
          const tokens = haiku.lines.join('\n').split(/\W/).map(token => token.toLowerCase());
          return lowercaseKeywords.some(keyword => {
            if (keyword.endsWith('*')) {
              return tokens.some(token => token.startsWith(keyword.slice(0, -1)));
            }
            return tokens.includes(keyword);
          });
        })
        .map(haiku => new Haiku(haiku.id, this.haikuMap[haiku.id]));
      resolve(result);
    });
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
