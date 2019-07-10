const cmuDict = require('cmu-pronouncing-dictionary');
const syllables = require('syllable');

exports.countSyllables = (line) => {
  const words = line.split(/\W+/);
  return words.map((word) => {
    const lowerWord = word.toLowerCase();
    if (lowerWord in cmuDict) {
      // Count number of syllables, indicated by digits in cmu dict
      return cmuDict[lowerWord].match(/\d/g).length;
    }
    return syllables(word);
  }).reduce((a, b) => a + b, 0);
};
