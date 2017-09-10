var assert = require('assert');
var haiku = require('../src/haiku')

describe('Haiku', function() {
	describe('#isHaiku()', function() {
		it('should return true for a haiku with 5/7/5 syllables', function() {
			let lines = [
			  "The first line has five.",
			  "The second line has seven.",
			  "The last line has five."]
			assert.ok(haiku.isHaiku(lines))
		})
	})
})