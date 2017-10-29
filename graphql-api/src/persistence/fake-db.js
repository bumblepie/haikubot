const { Haiku } = require('../domain/types/Haiku');

class FakeDB {
  constructor() {
    this.count = 0;
    this.haikuMap = {};
  }

  createHaiku(haikuInput) {
    const id = this.count;
    this.count += 1;
    this.haikuMap[id] = haikuInput;
    return new Haiku(id, haikuInput);
  }

  getHaiku(id) {
    if (!this.haikuMap[id]) {
      throw new Error(`No haiku with id ${id} found`);
    }
    return new Haiku(id, this.haikuMap[id]);
  }

  clearHaiku(id) {
    delete this.haikuMap[id];
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
