const { FakeHaikuDB } = require('../../src/persistence/fake-db');
const { testRepo } = require('./repo-tests');

const repo = new FakeHaikuDB();
testRepo(repo, 'Fake DB');
