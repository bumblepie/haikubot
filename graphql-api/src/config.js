/* What type of db to use:
 * - FAKE
 * - MY_SQL
 */
exports.db = process.env.DB_TYPE;

// MySQL config
exports.mySQLHost = process.env.MYSQL_HOST;
exports.mySQLUser = process.env.MYSQL_USER;
exports.mySQLPassword = process.env.MYSQL_PASSWORD;
