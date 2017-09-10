const isHaiku = (lines) => {
  if(!(lines instanceof Array)) {
    throw "An array of strings was expected.";
  }

  if(lines.length != 3) {
    throw Error("Incorrect number of lines.");
  }

  for(index = 0; index < lines.length; index++) {
    let line = lines[index];
    if(typeof line != "string") {
      throw Error("An array of strings was expected.");
    }

    let expectedSyllables = 0;
    switch(index) {
      case 0:
      case 2: expectedSyllables = 5;
              break;
      case 1: expectedSyllables = 7;
              break;
    }
    if(/*syllables(line)*/0 != expectedSyllables) {
      return false;
    }
  };

  return true;
};

exports.isHaiku = (lines) => isHaiku(lines);