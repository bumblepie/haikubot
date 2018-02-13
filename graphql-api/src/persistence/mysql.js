const { Haiku } = require('../domain/types/Haiku');
const mysql = require('mysql');

class MySqlDB {
  constructor(dbName) {
    this.DB_NAME = dbName;
  }

  async init() {
    if (process.env.MYSQL_HOST == null
    || process.env.MYSQL_USER == null
    || process.env.MYSQL_PASSWORD == null) {
      throw Error('Some mysql environment variables not set');
    }
    this.connection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    });

    await this.connect();

    await this.createDatabase();

    this.connection.end();

    this.connection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: this.DB_NAME,
    });

    await this.connect();

    await this.createTables();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  disconnect() {
    this.connection.end();
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  async createDatabase() {
    await this.query(`CREATE DATABASE IF NOT EXISTS ${this.DB_NAME};`);
  }

  async createTables() {
    const createHaikusTableSQL = `CREATE TABLE IF NOT EXISTS haikus
                    (ID MEDIUMINT NOT NULL AUTO_INCREMENT,
                    serverID VARCHAR(255) NOT NULL,
                    channelID VARCHAR(255) NOT NULL,
                    creationTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (ID, serverID));`;
    const createLinesTableSQL = `CREATE TABLE IF NOT EXISTS haikuLines
                    (haikuID MEDIUMINT NOT NULL,
                    haikuServerID VARCHAR(255) NOT NULL,
                    lineIndex TINYINT NOT NULL,
                    content VARCHAR(1024) NOT NULL,
                    PRIMARY KEY (haikuID, haikuServerID, lineIndex),
                    FOREIGN KEY (haikuID, haikuServerID)
                      REFERENCES haikus(ID, serverID));`;
    const createAuthorsTableSQL = `CREATE TABLE IF NOT EXISTS authors
                    (haikuID MEDIUMINT NOT NULL,
                    haikuServerID VARCHAR(255) NOT NULL,
                    authorID VARCHAR(255) NOT NULL,
                    PRIMARY KEY (haikuID, haikuServerID, authorID),
                    FOREIGN KEY (haikuID, haikuServerID)
                      REFERENCES haikus(ID, serverID));`;
    await this.query(createHaikusTableSQL);
    await this.query(createLinesTableSQL);
    await this.query(createAuthorsTableSQL);
  }

  async createHaiku(haikuInput) {
    const result = await this.query(`INSERT INTO haikus (serverID, channelID)
      values ("${haikuInput.serverId}", "${haikuInput.channelId}");`);
    const id = result.insertId;

    const authorValues = haikuInput.authors
      .map(author => `("${id}", "${haikuInput.serverId}", "${author}")`)
      .join(',');

    await this.query(`INSERT INTO authors (haikuID, haikuServerID, authorID)
      values ${authorValues};`);

    const lineValues = haikuInput.lines
      .map((line, index) => `("${id}", "${haikuInput.serverId}", ${index}, "${line}")`)
      .join(',');
    await this.query(`INSERT INTO haikuLines (haikuID, haikuServerID, lineIndex, content)
      values ${lineValues};`);

    return this.getHaiku(haikuInput.serverId, id);
  }

  async getHaiku(serverId, id) {
    const haikusResult = await this.query(`SELECT * FROM haikus WHERE ID="${id}" AND serverID="${serverId}"`);
    const linesResult = await this.query(`SELECT * FROM haikuLines WHERE haikuID="${id}" AND haikuServerID="${serverId}"`);
    const authorsResult = await this.query(`SELECT * FROM authors WHERE haikuID="${id}" AND haikuServerID="${serverId}"`);
    if (haikusResult.length === 0) {
      throw new Error(`No haiku with id ${id} found in server ${serverId}`);
    } else if (linesResult.length !== 3) {
      throw new Error(`Haiku with id ${id} in server ${serverId} has incorrect number of lines`);
    } else if (authorsResult.length === 0) {
      throw new Error(`Haiku with id ${id} in server ${serverId} has no author`);
    } else {
      const haiku = haikusResult[0];
      const lines = linesResult.sort((result1, result2) => result1.lineIndex - result2.lineIndex)
        .map(result => result.content);
      const authors = authorsResult.map(result => result.authorID);
      return new Haiku(haiku.ID, {
        lines,
        authors,
        channel: haiku.channelID,
        server: haiku.serverID,
      });
    }
  }

  async clearHaiku(serverId, id) {
    await this.query(`DELETE FROM haikuLines WHERE haikuID="${id}" AND haikuServerID="${serverId}"`);
    await this.query(`DELETE FROM authors WHERE haikuID="${id}" AND haikuServerID="${serverId}"`);
    await this.query(`DELETE FROM haikus WHERE ID="${id}" AND serverID="${serverId}"`);
  }

  async clearAllHaikus() {
    await this.query('DROP TABLE haikuLines');
    await this.query('DROP TABLE authors');
    await this.query('DROP TABLE haikus');
    await this.createTables();
    console.debug('tables created');
  }

  getChannel(id) {
    return { id };
  }

  getServer(id) {
    return { id };
  }
}

exports.MySqlDB = MySqlDB;
