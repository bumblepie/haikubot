const assert = require('assert');
const { Haiku } = require('../src/types/Haiku');
const { formatHaiku } = require('../src/formatHaiku');
const { describe, it } = require('mocha');

describe('formatHaiku', () => {
  describe('#formatHaiku', () => {
    it('should correctly format a haiku', () => {
      const haiku = new Haiku('id', { authors: ['author'], lines: ['line 1', 'line 2', 'line 3'] });
      const expected =
      '<@author> has created a beautiful Haiku!\n' +
      '"line 1\n' +
      ' line 2\n' +
      ' line 3"\n' +
      ' - Haiku #id';
      assert.equal(formatHaiku(haiku), expected);
    });
  });
});
