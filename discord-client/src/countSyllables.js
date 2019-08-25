const cmuDict = require('cmu-pronouncing-dictionary');
const syllables = require('syllable');

exports.countSyllables = (line) => {
  const words = line.split(/\s+/)
    .filter(word => word.length > 0);

  return words.map((word) => {
    const lowerWord = word.toLowerCase();
    if (lowerWord in cmuDict) {
      // Count number of syllables, indicated by digits in cmu dict
      return cmuDict[lowerWord].match(/\d/g).length;
    }
    const count = syllables(word);
    // Ignore lines with words that count to 0 in them as they are suspect
    if (count < 1) {
      throw Error(`Couldn't count syllables of word '${word}'`);
    }
    return count;
  }).reduce((a, b) => a + b, 0);
};
