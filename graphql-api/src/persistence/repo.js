const config = require('../config');
const { MySqlHaikuDB } = require('./mysql');
const { SQLiteHaikuDB } = require('./sqlite');
const { FakeHaikuDB } = require('./fake-db');

exports.newHaikuRepository = () => {
  if (config.db === 'MY_SQL') {
    console.debug('Using MYSQL database');
    return new MySqlHaikuDB(config);
  }
  if (config.db === 'SQLITE') {
    console.debug('Using SQLITE database');
    return new SQLiteHaikuDB(config);
  }
  console.debug('Using FakeDB database');
  return new FakeHaikuDB();
};
