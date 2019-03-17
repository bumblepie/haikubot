const { MySqlHaikuDB } = require('../../src/persistence/mysql');
const { testRepo } = require('./repo-tests');

const repo = new MySqlHaikuDB();
testRepo(repo, 'MY_SQL DB');
