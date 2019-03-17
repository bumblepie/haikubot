const { SQLiteHaikuDB } = require('../../src/persistence/sqlite');
const { testRepo } = require('./repo-tests');
const config = require('../config');

const repo = new SQLiteHaikuDB(config);
testRepo(repo, 'SQLite DB');
