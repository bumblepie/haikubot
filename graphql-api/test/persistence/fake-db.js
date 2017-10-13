const assert = require('assert');
const { FakeDB } = require('../../src/persistence/fake-db.js');
const { describe, it, beforeEach } = require('mocha');

const exampleHaiku = {
  authors: ['author'],
  lines: ['line1', 'line2', 'line3'],
};

const exampleHaiku2 = {
  authors: ['author_2', 'author_3'],
  lines: ['line4', 'line5', 'line6'],
};

function assertHaikuNotInRepo(repo, id) {
  assert.throws(() => repo.getHaiku(id), new RegExp(`No haiku with id ${id} found`));
}

describe('fake-db', () => {
  let repo = new FakeDB();

  beforeEach(() => {
    repo = new FakeDB();
  });

  describe('#clearAllHaikus', () => {
    it('should remove any haikus that have been previously created', () => {
      const { id } = repo.createHaiku(exampleHaiku);
      repo.getHaiku(id);
      repo.clearAllHaikus();
      assertHaikuNotInRepo(repo, id);
    });

    it('should remove multiple haikus', () => {
      const ids = [];
      const NUM_HAIKUS = 5;
      for (let i = 0; i < NUM_HAIKUS; i += 1) {
        const createResult = repo.createHaiku(exampleHaiku);
        ids.push(createResult.id);
      }
      for (let i = 0; i < NUM_HAIKUS; i += 1) {
        // shouldn't throw errs
        repo.getHaiku(ids[i]);
      }
      repo.clearAllHaikus();
      for (let i = 0; i < NUM_HAIKUS; i += 1) {
        // should throw errs now db has been cleared
        assertHaikuNotInRepo(repo, ids[i]);
      }
    });
  });

  describe('#clearHaiku', () => {
    it('should clear a single haiku from the db', () => {
      const { id } = repo.createHaiku(exampleHaiku);
      repo.getHaiku(id);
      repo.clearHaiku(id);
      assertHaikuNotInRepo(repo, id);
    });

    it('should clear only the specified haiku from the db', () => {
      const id1 = repo.createHaiku(exampleHaiku).id;
      const id2 = repo.createHaiku(exampleHaiku).id;
      repo.getHaiku(id1);
      repo.getHaiku(id2);
      repo.clearHaiku(id1);
      assertHaikuNotInRepo(repo, id1);
      repo.getHaiku(id2);
    });
  });

  describe('#createHaiku', () => {
    it('should create a haiku that can be recieved by #getHaiku', () => {
      const createResult = repo.createHaiku(exampleHaiku);
      const getResult = repo.getHaiku(createResult.id);
      assert(getResult.authors === exampleHaiku.authors);
      assert(getResult.lines === exampleHaiku.lines);
    });

    it('should return the created haiku (consistent with #getHaiku)', () => {
      const createResult = repo.createHaiku(exampleHaiku);
      assert(createResult.authors === exampleHaiku.authors);
      assert(createResult.lines === exampleHaiku.lines);
      const getResult = repo.getHaiku(createResult.id);
      assert(getResult.authors === exampleHaiku.authors);
      assert(getResult.lines === exampleHaiku.lines);
    });

    it('should create different haikus even for the same haiku', () => {
      const id1 = repo.createHaiku(exampleHaiku).id;
      const id2 = repo.createHaiku(exampleHaiku).id;
      assert.notEqual(id1, id2);
    });
  });

  describe('#getHaiku', () => {
    it('should return a haiku that has been inserted into the fake db', () => {
      const createResult = repo.createHaiku(exampleHaiku);
      const getResult = repo.getHaiku(createResult.id);
      assert(getResult.authors === exampleHaiku.authors);
      assert(getResult.lines === exampleHaiku.lines);
    });

    it('should return the correct haiku', () => {
      const createResult = repo.createHaiku(exampleHaiku);
      const createResult2 = repo.createHaiku(exampleHaiku2);
      let getResult = repo.getHaiku(createResult.id);
      assert(getResult.authors === exampleHaiku.authors);
      assert(getResult.lines === exampleHaiku.lines);

      getResult = repo.getHaiku(createResult2.id);
      assert(getResult.authors === exampleHaiku2.authors);
      assert(getResult.lines === exampleHaiku2.lines);
    });

    it('should throw an error if getting a haiku that should not exist in the db', () => {
      const id = 'xxx';
      assertHaikuNotInRepo(repo, id);
    });
  });
});
