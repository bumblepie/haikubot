const { SQLiteHaikuDB } = require('../../src/persistence/sqlite');
const { testRepo } = require('./repo-tests');

const repo = new SQLiteHaikuDB();
testRepo(repo, 'SQLite DB');
