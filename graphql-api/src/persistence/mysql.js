const { Haiku } = require('../domain/types/Haiku');
const mysql = require('mysql');
const config = require('../config');

class MySqlHaikuDB {
  constructor() {
    this.DB_NAME = config.mySQLDBName;
  }

  async init() {
    if (config.mySQLHost == null
    || config.mySQLUser == null
    || config.mySQLPassword == null) {
      throw Error('Some mysql environment variables not set');
    }
    this.connection = mysql.createConnection({
      host: config.mySQLHost,
      user: config.mySQLUser,
      password: config.mySQLPassword,
    });

    await this.connect();

    await this.createDatabase();

    await this.disconnect();

    this.connection = mysql.createConnection({
      host: config.mySQLHost,
      user: config.mySQLUser,
      password: config.mySQLPassword,
      database: this.DB_NAME,
    });

    await this.connect();

    await this.createTables();
  }

  async close() {
    await this.disconnect();
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
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
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
    const result = await this.query(mysql.format(`INSERT INTO haikus (serverID, channelID)
      values (?, ?)`, [haikuInput.serverId, haikuInput.channelId]));
    const id = result.insertId;

    const authorValues = haikuInput.authors
      .map(author => [id, haikuInput.serverId, author])
      .reduce((values, nextAuthorValues) => [...values, ...nextAuthorValues], []);
    const authorValuesPlaceholders = haikuInput.authors
      .map(() => '(?, ?, ?)')
      .join(',');

    await this.query(mysql.format(`INSERT INTO authors (haikuID, haikuServerID, authorID)
      values ${authorValuesPlaceholders};`, authorValues));

    const lineValues = haikuInput.lines
      .map((line, index) => [id, haikuInput.serverId, index, line])
      .reduce((values, nextLineValues) => [...values, ...nextLineValues], []);
    const lineValuesPlaceholders = haikuInput.lines
      .map(() => '(?, ?, ?, ?)')
      .join(',');
    await this.query(mysql.format(`INSERT INTO haikuLines (haikuID, haikuServerID, lineIndex, content)
      values ${lineValuesPlaceholders};`, lineValues));

    return this.getHaiku(haikuInput.serverId, id);
  }

  async getHaiku(serverId, id) {
    const haikusResult = await this.query(mysql.format('SELECT * FROM haikus WHERE ID=? AND serverID=?', [id, serverId]));
    const linesResult = await this.query(mysql.format('SELECT * FROM haikuLines WHERE haikuID=? AND haikuServerID=?', [id, serverId]));
    const authorsResult = await this.query(mysql.format('SELECT * FROM authors WHERE haikuID=? AND haikuServerID=?', [id, serverId]));
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
    await this.query(mysql.format('DELETE FROM haikuLines WHERE haikuID=? AND haikuServerID=?', [id, serverId]));
    await this.query(mysql.format('DELETE FROM authors WHERE haikuID=? AND haikuServerID=?', [id, serverId]));
    await this.query(mysql.format('DELETE FROM haikus WHERE ID=? AND serverID=?', [id, serverId]));
  }

  async clearAllHaikus() {
    await this.query('DROP TABLE haikuLines');
    await this.query('DROP TABLE authors');
    await this.query('DROP TABLE haikus');
    await this.createTables();
  }

  /* eslint-disable class-methods-use-this */
  getChannel(id) {
    return { id };
  }

  getServer(id) {
    return { id };
  }
  /* eslint-enable class-methods-use-this */
}

exports.MySqlHaikuDB = MySqlHaikuDB;
