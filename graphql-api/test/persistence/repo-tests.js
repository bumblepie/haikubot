const assert = require('assert');
const {
  after,
  before,
  beforeEach,
  describe,
  it,
} = require('mocha');

const exampleHaikuInput = {
  authors: ['author'],
  lines: ['line1', 'line2', 'line3'],
  serverId: 'server1',
  channelId: 'channel1',
};

const exampleHaiku = {
  authors: exampleHaikuInput.authors,
  lines: exampleHaikuInput.lines,
  server: exampleHaikuInput.serverId,
  channel: exampleHaikuInput.channelId,
};

const exampleHaikuInput2 = {
  authors: ['author_2', 'author_3'],
  lines: ['line4', 'line5', 'line6'],
  serverId: 'server2',
  channelId: 'channel2',
};

const exampleHaiku2 = {
  authors: exampleHaikuInput2.authors,
  lines: exampleHaikuInput2.lines,
  server: exampleHaikuInput2.serverId,
  channel: exampleHaikuInput2.channelId,
};

const assertHaikuNotInRepo = async (repo, serverId, id) => {
  await assert.rejects(() => repo.getHaiku(serverId, id), Error(`No haiku with id ${id} found in server ${serverId}`));
};

exports.testRepo = (repo, repoType) => {
  describe(repoType, () => {
    before(async () => {
      await repo.init();
    });

    after(async () => {
      await repo.close();
    });

    beforeEach(async () => {
      await repo.clearAllHaikus();
    });

    describe('#clearAllHaikus', async () => {
      it('should remove any haikus that have been previously created', async () => {
        const { id } = await repo.createHaiku(exampleHaikuInput);
        await repo.getHaiku(exampleHaikuInput.serverId, id);
        await repo.clearAllHaikus();
        await assertHaikuNotInRepo(repo, exampleHaikuInput.serverId, id);
      });

      it('should remove multiple haikus', async () => {
        const NUM_HAIKUS = 5;
        const createPromises = [];
        for (let i = 0; i < NUM_HAIKUS; i += 1) {
          createPromises.push(repo.createHaiku(exampleHaikuInput));
        }
        const createResults = await Promise.all(createPromises);
        const ids = createResults.map(haiku => haiku.id);

        const getPromises = [];
        for (let i = 0; i < NUM_HAIKUS; i += 1) {
          getPromises.push(repo.getHaiku(exampleHaikuInput.serverId, ids[i]));
        }
        // shouldn't throw errs
        await Promise.all(getPromises);

        await repo.clearAllHaikus();

        const assertPromises = [];
        for (let i = 0; i < NUM_HAIKUS; i += 1) {
          assertPromises.push(assertHaikuNotInRepo(repo, exampleHaikuInput.serverId, ids[i]));
        }
        // should throw errs now db has been cleared
        await Promise.all(assertPromises);
      });
    });

    describe('#clearHaiku', () => {
      it('should clear a single haiku from the db', async () => {
        const { id } = await repo.createHaiku(exampleHaikuInput);
        await repo.getHaiku(exampleHaikuInput.serverId, id);
        await repo.clearHaiku(exampleHaikuInput.serverId, id);
        await assertHaikuNotInRepo(repo, exampleHaikuInput.serverId, id);
      });

      it('should clear only the specified haiku from the db', async () => {
        const id1 = (await repo.createHaiku(exampleHaikuInput)).id;
        const id2 = (await repo.createHaiku(exampleHaikuInput)).id;
        await repo.getHaiku(exampleHaikuInput.serverId, id1);
        await repo.getHaiku(exampleHaikuInput.serverId, id2);
        await repo.clearHaiku(exampleHaikuInput.serverId, id1);
        await assertHaikuNotInRepo(repo, exampleHaikuInput.serverId, id1);
        await repo.getHaiku(exampleHaikuInput.serverId, id2);
      });
    });

    describe('#createHaiku', () => {
      it('should create a haiku that can be recieved by #getHaiku', async () => {
        const createResult = await repo.createHaiku(exampleHaikuInput);
        const getResult = await repo.getHaiku(exampleHaikuInput.serverId, createResult.id);
        assert.deepEqual(getResult.authors, exampleHaikuInput.authors);
        assert.deepEqual(getResult.lines, exampleHaikuInput.lines);
      });

      it('should return the created haiku (consistent with #getHaiku)', async () => {
        const createResult = await repo.createHaiku(exampleHaikuInput);
        assert.deepEqual(createResult.authors, exampleHaikuInput.authors);
        assert.deepEqual(createResult.lines, exampleHaikuInput.lines);
        const getResult = await repo.getHaiku(exampleHaikuInput.serverId, createResult.id);
        assert.deepEqual(getResult.authors, exampleHaikuInput.authors);
        assert.deepEqual(getResult.lines, exampleHaikuInput.lines);
      });

      it('should create haikus with different ids even for the same haiku', async () => {
        const id1 = (await repo.createHaiku(exampleHaikuInput)).id;
        const id2 = (await repo.createHaiku(exampleHaikuInput)).id;
        assert.notEqual(id1, id2);
      });
    });

    describe('#getHaiku', () => {
      it('should return a haiku that has been inserted into the fake db', async () => {
        const { id } = await repo.createHaiku(exampleHaikuInput);
        const getResult = await repo.getHaiku(exampleHaikuInput.serverId, id);
        assert.deepEqual(getResult, { id, ...exampleHaiku });
      });

      it('should return the correct haiku', async () => {
        const { id } = await repo.createHaiku(exampleHaikuInput);
        const createResult = await repo.createHaiku(exampleHaikuInput2);
        const id2 = createResult.id;
        let getResult = await repo.getHaiku(exampleHaikuInput.serverId, id);
        assert.deepEqual(getResult, { id, ...exampleHaiku });

        getResult = await repo.getHaiku(exampleHaikuInput2.serverId, id2);
        assert.deepEqual(getResult, { id: id2, ...exampleHaiku2 });
      });

      it('should throw an error if getting a haiku that should not exist in the db', async () => {
        const id = 'xxx';
        await assertHaikuNotInRepo(repo, id);
      });

      it('should return a haiku with the same timestamp each time it is fetched', async () => {
        const createResult = await repo.createHaiku(exampleHaiku);
        let getResult = await repo.getHaiku(exampleHaiku.serverId, createResult.id);
        const firstDate = getResult.timestamp;
        getResult = await repo.getHaiku(exampleHaiku.serverId, createResult.id);
        const secondDate = getResult.timestamp;

        // Ensure it is not undefined/null or an unexpected object
        assert(firstDate instanceof Date);
        assert(secondDate instanceof Date);

        // Ensure they are the same value (not just the current date)
        assert.deepEqual(firstDate, secondDate);
      });
    });

    describe('#searchHaikus', () => {
      it('should find a haiku with a specified keyword in the db', async () => {
        const { id } = await repo.createHaiku(exampleHaikuInput);
        const searchResults = await repo.searchHaikus(['line1']);
        assert.deepEqual(searchResults, [{ id, ...exampleHaiku }]);
      });

      it('should find a haiku with a specified keyword with different case in the db', async () => {
        const { id } = await repo.createHaiku(exampleHaikuInput);
        const searchResults = await repo.searchHaikus(['LiNE1']);
        assert.deepEqual(searchResults, [{ id, ...exampleHaiku }]);
      });

      it('should find no haikus if none match any of the specified keywords in the db', async () => {
        await repo.createHaiku(exampleHaikuInput);
        const searchResults = await repo.searchHaikus(['not', 'in', 'haikus']);
        assert.deepEqual(searchResults, []);
      });

      it('should find only haikus with a specified keyword in the db', async () => {
        const { id } = await repo.createHaiku(exampleHaikuInput);
        await repo.createHaiku(exampleHaikuInput2);
        const searchResults = await repo.searchHaikus(['line1']);
        assert.deepEqual(searchResults, [{ id, ...exampleHaiku }]);
      });

      it('should find multiple haikus if they all match a specified keyword in the db', async () => {
        const { id } = await repo.createHaiku(exampleHaikuInput);
        const id2 = (await repo.createHaiku(exampleHaikuInput)).id;
        const searchResults = await repo.searchHaikus(['line1']);
        assert.deepEqual(searchResults, [{ id, ...exampleHaiku }, { id: id2, ...exampleHaiku }]);
      });

      it('should find haikus if they all match a prefix keyword in the db', async () => {
        const { id } = await repo.createHaiku(exampleHaikuInput);
        const id2 = (await repo.createHaiku(exampleHaikuInput2)).id;
        const searchResults = await repo.searchHaikus(['line*']);
        assert.deepEqual(searchResults, [{ id, ...exampleHaiku }, { id: id2, ...exampleHaiku2 }]);
      });

      it('should find multiple haikus if they all match any of the specified keywords in the db', async () => {
        const { id } = await repo.createHaiku(exampleHaikuInput);
        const id2 = (await repo.createHaiku(exampleHaikuInput2)).id;
        const searchResults = await repo.searchHaikus(['line1', 'line4']);
        assert.deepEqual(searchResults, [{ id, ...exampleHaiku }, { id: id2, ...exampleHaiku2 }]);
      });

      it('should throw an error if no keywords are given', async () => {
        await assert.rejects(() => repo.searchHaikus([], Error('No keywords given')));
      });

      it('should throw an error any invalid keywords are given', async () => {
        // Valid inputs should not throw errors
        await repo.searchHaikus(['valid', 'also_valid*']);

        await assert.rejects(() => repo.searchHaikus(['asd!', 'as?d', '#asd', '\'asd', ''], Error('Invalid keywords: [\'asd!\', \'as?d\', \'#asd\', \'\\\'asd\', \'\']')));
        await assert.rejects(() => repo.searchHaikus(['valid', 'inval!d', 'also_valid*'], Error('Invalid keywords: [\'inval!d\']')));
      });
    });
  });
};
