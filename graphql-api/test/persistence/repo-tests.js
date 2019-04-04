const assert = require('assert');
const {
  after,
  before,
  beforeEach,
  describe,
  it,
} = require('mocha');

const exampleHaiku = {
  authors: ['author'],
  lines: ['line1', 'line2', 'line3'],
  serverId: 'server1',
  channelId: 'channel1',
};

const exampleHaiku2 = {
  authors: ['author_2', 'author_3'],
  lines: ['line4', 'line5', 'line6'],
  serverId: 'server2',
  channelId: 'channel2',
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
        const { id } = await repo.createHaiku(exampleHaiku);
        await repo.getHaiku(exampleHaiku.serverId, id);
        await repo.clearAllHaikus();
        await assertHaikuNotInRepo(repo, exampleHaiku.serverId, id);
      });

      it('should remove multiple haikus', async () => {
        const NUM_HAIKUS = 5;
        const createPromises = [];
        for (let i = 0; i < NUM_HAIKUS; i += 1) {
          createPromises.push(repo.createHaiku(exampleHaiku));
        }
        const createResults = await Promise.all(createPromises);
        const ids = createResults.map(haiku => haiku.id);

        const getPromises = [];
        for (let i = 0; i < NUM_HAIKUS; i += 1) {
          getPromises.push(repo.getHaiku(exampleHaiku.serverId, ids[i]));
        }
        // shouldn't throw errs
        await Promise.all(getPromises);

        await repo.clearAllHaikus();

        const assertPromises = [];
        for (let i = 0; i < NUM_HAIKUS; i += 1) {
          assertPromises.push(assertHaikuNotInRepo(repo, exampleHaiku.serverId, ids[i]));
        }
        // should throw errs now db has been cleared
        await Promise.all(assertPromises);
      });
    });

    describe('#clearHaiku', () => {
      it('should clear a single haiku from the db', async () => {
        const { id } = await repo.createHaiku(exampleHaiku);
        await repo.getHaiku(exampleHaiku.serverId, id);
        await repo.clearHaiku(exampleHaiku.serverId, id);
        await assertHaikuNotInRepo(repo, exampleHaiku.serverId, id);
      });

      it('should clear only the specified haiku from the db', async () => {
        const id1 = (await repo.createHaiku(exampleHaiku)).id;
        const id2 = (await repo.createHaiku(exampleHaiku)).id;
        await repo.getHaiku(exampleHaiku.serverId, id1);
        await repo.getHaiku(exampleHaiku.serverId, id2);
        await repo.clearHaiku(exampleHaiku.serverId, id1);
        await assertHaikuNotInRepo(repo, exampleHaiku.serverId, id1);
        await repo.getHaiku(exampleHaiku.serverId, id2);
      });
    });

    describe('#createHaiku', () => {
      it('should create a haiku that can be recieved by #getHaiku', async () => {
        const createResult = await repo.createHaiku(exampleHaiku);
        const getResult = await repo.getHaiku(exampleHaiku.serverId, createResult.id);
        assert.deepEqual(getResult.authors, exampleHaiku.authors);
        assert.deepEqual(getResult.lines, exampleHaiku.lines);
      });

      it('should return the created haiku (consistent with #getHaiku)', async () => {
        const createResult = await repo.createHaiku(exampleHaiku);
        assert.deepEqual(createResult.authors, exampleHaiku.authors);
        assert.deepEqual(createResult.lines, exampleHaiku.lines);
        const getResult = await repo.getHaiku(exampleHaiku.serverId, createResult.id);
        assert.deepEqual(getResult.authors, exampleHaiku.authors);
        assert.deepEqual(getResult.lines, exampleHaiku.lines);
      });

      it('should create haikus with different ids even for the same haiku', async () => {
        const id1 = (await repo.createHaiku(exampleHaiku)).id;
        const id2 = (await repo.createHaiku(exampleHaiku)).id;
        assert.notEqual(id1, id2);
      });
    });

    describe('#getHaiku', () => {
      it('should return a haiku that has been inserted into the db', async () => {
        const createResult = await repo.createHaiku(exampleHaiku);
        const getResult = await repo.getHaiku(exampleHaiku.serverId, createResult.id);
        assert.deepEqual(getResult.authors, exampleHaiku.authors);
        assert.deepEqual(getResult.lines, exampleHaiku.lines);
      });

      it('should return the correct haiku', async () => {
        const createResult = await repo.createHaiku(exampleHaiku);
        const createResult2 = await repo.createHaiku(exampleHaiku2);
        let getResult = await repo.getHaiku(exampleHaiku.serverId, createResult.id);
        assert.deepEqual(getResult.authors, exampleHaiku.authors);
        assert.deepEqual(getResult.lines, exampleHaiku.lines);

        getResult = await repo.getHaiku(exampleHaiku2.serverId, createResult2.id);
        assert.deepEqual(getResult.authors, exampleHaiku2.authors);
        assert.deepEqual(getResult.lines, exampleHaiku2.lines);
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
  });
};
