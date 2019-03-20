const { MySqlHaikuDB } = require('../../src/persistence/mysql');
const { testRepo } = require('./repo-tests');
const config = require('../config');

const repo = new MySqlHaikuDB(config);
testRepo(repo, 'MY_SQL DB');
