const { Haiku } = require('../types/Haiku')

const haikuMap = {}

const createHaiku = (haiku) => {
  id = "xxx"
  haikuMap[id] = haiku;
  return new Haiku(id, haiku)
}

const loadHaiku = (id) => {
  if(!haikuMap[id]) {
    throw new Error(`No haiku with id ${id} found`);
  }

  return new Haiku(id, haikuMap[id]);
}

exports.createHaiku = createHaiku;
exports.loadHaiku = loadHaiku;
