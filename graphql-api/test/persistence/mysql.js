const assert = require('assert');
const { MySqlDB } = require('../../src/persistence/mysql.js');
const {
  describe,
  it,
  beforeEach,
  afterEach,
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
  channelId: 'channel1',
};

async function assertHaikuNotInRepo(repo, serverId, id) {
  await new Promise((resolve, reject) => {
    repo.getHaiku(serverId, id)
      .then(() => reject(Error('Should have thrown error')), (err) => {
        assert.deepEqual(err, Error(`No haiku with id ${id} found in server ${serverId}`));
        resolve();
      });
  });
}

describe('mysql', () => {
  let repo;

  beforeEach(async () => {
    repo = new MySqlDB('test');
    await repo.init();
  });

  afterEach(async () => {
    await repo.clearAllHaikus();
    repo.disconnect();
  });

  describe('#clearAllHaikus', () => {
    it('should remove any haikus that have been previously created', async () => {
      const { id } = await repo.createHaiku(exampleHaiku);
      await repo.getHaiku(exampleHaiku.serverId, id);
      await repo.clearAllHaikus();
      await assertHaikuNotInRepo(repo, exampleHaiku.serverId, id);
    });

    it('should remove multiple haikus', async () => {
      const NUM_HAIKUS = 5;
      const createResults = [];
      for (let i = 0; i < NUM_HAIKUS; i += 1) {
        createResults.push(repo.createHaiku(exampleHaiku));
      }
      const ids = (await Promise.all(createResults))
        .map(result => result.id);

      const getRequests = [];
      for (let i = 0; i < NUM_HAIKUS; i += 1) {
        // shouldn't throw errs
        getRequests.push(repo.getHaiku(exampleHaiku.serverId, ids[i]));
      }
      await Promise.all(getRequests);

      await repo.clearAllHaikus();
      const haikuChecks = [];
      for (let i = 0; i < NUM_HAIKUS; i += 1) {
        // should throw errs now db has been cleared
        haikuChecks.push(assertHaikuNotInRepo(repo, exampleHaiku.serverId, ids[i]));
      }
      await Promise.all(haikuChecks);
    });
  });

  describe('#clearHaiku', () => {
    it('should clear a single haiku from the db', async () => {
      const { id } = await repo.createHaiku(exampleHaiku);
      await repo.getHaiku(exampleHaiku.serverId, id);
      await repo.clearHaiku(exampleHaiku.serverId, id);
      await assertHaikuNotInRepo(repo, exampleHaiku.serverId, id);
    });

    it('should clear the specified haiku from the db', async () => {
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

    it('should create different haikus even for the same haiku', async () => {
      const id1 = (await repo.createHaiku(exampleHaiku)).id;
      const id2 = (await repo.createHaiku(exampleHaiku)).id;
      assert.notEqual(id1, id2);
    });
  });

  describe('#getHaiku', () => {
    it('should return a haiku that has been inserted into the fake db', async () => {
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
      const serverId = 'server1';
      await assertHaikuNotInRepo(repo, serverId, id);
    });
  });
});
