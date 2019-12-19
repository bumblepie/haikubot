const { countSyllables } = require('./countSyllables');

const isHaiku = (lines) => {
  if (!(lines instanceof Array)) {
    throw Error('An array of strings was expected.');
  }

  if (lines.length !== 3) {
    throw Error('Incorrect number of lines.');
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (typeof line !== 'string') {
      throw Error('An array of strings was expected.');
    }
    // Fail if any lines have digits in them as they are ambiguous at best
    if (line.match(/\d/g)) {
      return false;
    }

    let expectedSyllables = 0;
    switch (index) {
      case 0:
      case 2: expectedSyllables = 5;
        break;
      case 1: expectedSyllables = 7;
        break;
      default: expectedSyllables = 0;
    }
    let syllableCount = 0;
    try {
      syllableCount = countSyllables(line);
    } catch (e) {
      syllableCount = 0;
    }
    if (syllableCount !== expectedSyllables) {
      return false;
    }
  }

  return true;
};

const getSingleLinehaiku = (line) => {
  if (typeof line !== 'string') {
    throw Error('A string was expected.');
  }

  // Fail if any lines have digits in them as they are ambiguous at best
  if (line.match(/\d/g)) {
    return null;
  }

  const words = line.split(/\s+/)
    .filter(word => word.length > 0);

  let totalSyllableCount = 0;
  const syllableCountCumulutive = [];
  try {
    words.forEach((word) => {
      totalSyllableCount += countSyllables(word);
      syllableCountCumulutive.push(totalSyllableCount);
    });
  } catch (_) {
    return null;
  }

  if (syllableCountCumulutive.includes(5)
  && syllableCountCumulutive.includes(12)
  && syllableCountCumulutive[syllableCountCumulutive.length - 1] === 17) {
    const fivePosition = syllableCountCumulutive.indexOf(5);
    const twelvePosition = syllableCountCumulutive.indexOf(12);
    const seventeenPosition = syllableCountCumulutive.indexOf(17);
    return [words.slice(0, fivePosition + 1).join(' '),
      words.slice(fivePosition + 1, twelvePosition + 1).join(' '),
      words.slice(twelvePosition + 1, seventeenPosition + 1).join(' ')];
  }
  return null;
};

exports.isHaiku = isHaiku;
exports.getSingleLinehaiku = getSingleLinehaiku;
