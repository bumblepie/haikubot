/* What type of db to use:
 * - FAKE
 * - MY_SQL
 * - SQLITE
 */
exports.db = process.env.DB_TYPE;

// MySQL config
exports.mySQLDBName = process.env.MYSQL_DB_NAME || 'test_haiku_db';
exports.mySQLHost = process.env.MYSQL_HOST || 'localhost';
exports.mySQLUser = process.env.MYSQL_USER;
exports.mySQLPassword = process.env.MYSQL_PASSWORD;

// SQLite config
exports.sqliteDBFile = process.env.SQLITE_DB_FILE || './deploy/db/test.db';
