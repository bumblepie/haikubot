const assert = require('assert');
const { Haiku } = require('../src/types/Haiku');
const { formatHaiku } = require('../src/formatHaiku');
const { describe, it } = require('mocha');

describe('formatHaiku', () => {
  describe('#formatHaiku', () => {
    it('should correctly format a haiku with a single author', () => {
      const haiku = new Haiku('id', { authors: ['author'], lines: ['line 1', 'line 2', 'line 3'] });
      const expected =
      '<@author> has created a beautiful Haiku!\n' +
      '"line 1\n' +
      ' line 2\n' +
      ' line 3"\n' +
      ' - Haiku #id';
      assert.equal(formatHaiku(haiku), expected);
    });

    it('should correctly format a haiku with two authors', () => {
      const haiku = new Haiku('id', { authors: ['author', 'author_2'], lines: ['line 1', 'line 2', 'line 3'] });
      const expected =
      '<@author> and <@author_2> have created a beautiful Haiku!\n' +
      '"line 1\n' +
      ' line 2\n' +
      ' line 3"\n' +
      ' - Haiku #id';
      assert.equal(formatHaiku(haiku), expected);
    });

    it('should correctly format a haiku with three authors', () => {
      const haiku = new Haiku('id', { authors: ['author', 'author_2', 'author_3'], lines: ['line 1', 'line 2', 'line 3'] });
      const expected =
      '<@author>, <@author_2> and <@author_3> have created a beautiful Haiku!\n' +
      '"line 1\n' +
      ' line 2\n' +
      ' line 3"\n' +
      ' - Haiku #id';
      assert.equal(formatHaiku(haiku), expected);
    });
  });
});
