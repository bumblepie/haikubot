const assert = require('assert');
const haiku = require('../src/haiku');
const { describe, it } = require('mocha');

describe('Haiku', () => {
  describe('#isHaiku()', () => {
    it('should return true for a haiku with 5/7/5 syllables', () => {
      const lines = [
        'The first line has five.',
        'The second line has seven.',
        'The last line has five.'];
      assert.ok(haiku.isHaiku(lines));
    });

    it('should return false if a line has fewer syllables', () => {
      let lines = [
        'First line has four.',
        'The second line has seven.',
        'The last line has five.'];
      assert.equal(haiku.isHaiku(lines), false);

      lines = [
        'The first line has five.',
        'The second line has six.',
        'The last line has five.'];
      assert.equal(haiku.isHaiku(lines), false);

      lines = [
        'The first line has five.',
        'The second line has seven.',
        'Last line has four.'];
      assert.equal(haiku.isHaiku(lines), false);
    });

    it('should return false if a line has more syllables', () => {
      let lines = [
        'First line has too many.',
        'The second line has seven.',
        'The last line has five.'];
      assert.equal(haiku.isHaiku(lines), false);

      lines = [
        'The first line has five.',
        'The second line has too many.',
        'The last line has five.'];
      assert.equal(haiku.isHaiku(lines), false);

      lines = [
        'The first line has five.',
        'The second line has seven.',
        'Last line has too many.'];
      assert.equal(haiku.isHaiku(lines), false);
    });

    it('should return throw an error if not given three lines', () => {
      let lines = [
        'The first line has five.',
        'The second line has seven.'];
      assert.throws(() => haiku.isHaiku(lines), /Incorrect number of lines\./);

      lines = [
        'The first line has five.',
        'The second line has seven.',
        'The last line has five.',
        'But there\'s an extra line!'];
      assert.throws(() => haiku.isHaiku(lines), /Incorrect number of lines\./);
    });

    it('should return throw an error if not given an array of strings', () => {
      let lines = {};
      assert.throws(() => haiku.isHaiku(lines), /An array of strings was expected\./);

      lines = 'Not an array.';
      assert.throws(() => haiku.isHaiku(lines), /An array of strings was expected\./);

      lines = [1, 'x', 'y'];
      assert.throws(() => haiku.isHaiku(lines), /An array of strings was expected\./);
    });
  });
});
