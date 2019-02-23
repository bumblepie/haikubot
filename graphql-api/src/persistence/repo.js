const config = require('../config');
const { MySqlHaikuDB } = require('./mysql');
const { FakeHaikuDB } = require('./fake-db');

exports.newHaikuRepository = () => {
  if (config.db === 'MY_SQL') {
    return new MySqlHaikuDB('haikuDB');
  }
  return new FakeHaikuDB();
};
