const mysql = require('mysql');
const { Haiku } = require('../domain/types/Haiku');
const { validateKeywords } = require('./common');

class MySqlHaikuDB {
  constructor(config) {
    this.dbName = config.mySQLDBName;
    this.mySQLHost = config.mySQLHost;
    this.mySQLUser = config.mySQLUser;
    this.mySQLPassword = config.mySQLPassword;
  }

  async init() {
    if (this.mySQLHost == null
    || this.mySQLUser == null
    || this.mySQLPassword == null) {
      throw Error('Some mysql environment variables not set');
    }
    this.connection = mysql.createConnection({
      host: this.mySQLHost,
      user: this.mySQLUser,
      password: this.mySQLPassword,
    });

    await this.connect();

    await this.createDatabase();

    await this.disconnect();

    this.connection = mysql.createConnection({
      host: this.mySQLHost,
      user: this.mySQLUser,
      password: this.mySQLPassword,
      database: this.dbName,
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
    await this.query(`CREATE DATABASE IF NOT EXISTS ${this.dbName};`);
  }

  async createTables() {
    const createHaikusTableSQL = `CREATE TABLE IF NOT EXISTS haikus
                    (ID MEDIUMINT NOT NULL AUTO_INCREMENT,
                    serverID VARCHAR(255) NOT NULL,
                    channelID VARCHAR(255) NOT NULL,
                    creationTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (ID));`;
    const createLinesTableSQL = `CREATE TABLE IF NOT EXISTS haikuLines
                    (haikuID MEDIUMINT NOT NULL,
                    line1 VARCHAR(1024) NOT NULL,
                    line2 VARCHAR(1024) NOT NULL,
                    line3 VARCHAR(1024) NOT NULL,
                    PRIMARY KEY (haikuID),
                    FOREIGN KEY (haikuID)
                      REFERENCES haikus(ID),
                    FULLTEXT(line1, line2, line3));`;
    const createAuthorsTableSQL = `CREATE TABLE IF NOT EXISTS authors
                    (haikuID MEDIUMINT NOT NULL,
                    authorID VARCHAR(255) NOT NULL,
                    PRIMARY KEY (haikuID, authorID),
                    FOREIGN KEY (haikuID)
                      REFERENCES haikus(ID));`;
    await this.query(createHaikusTableSQL);
    await this.query(createLinesTableSQL);
    await this.query(createAuthorsTableSQL);
  }

  async createHaiku(haikuInput) {
    const result = await this.query(mysql.format(`INSERT INTO haikus (serverID, channelID)
      values (?, ?)`, [haikuInput.serverId, haikuInput.channelId]));
    const id = result.insertId;

    const authorValues = haikuInput.authors
      .map(author => [id, author])
      .reduce((values, nextAuthorValues) => [...values, ...nextAuthorValues], []);
    const authorValuesPlaceholders = haikuInput.authors
      .map(() => '(?, ?)')
      .join(',');

    await this.query(mysql.format(`INSERT INTO authors (haikuID, authorID)
      values ${authorValuesPlaceholders};`, authorValues));

    const lineValues = [id,
      haikuInput.lines[0],
      haikuInput.lines[1],
      haikuInput.lines[2],
    ];
    await this.query(mysql.format(`INSERT INTO haikuLines (haikuID, line1, line2, line3)
      values (?, ?, ?, ?)`, lineValues));

    return this.getHaiku(haikuInput.serverId, id);
  }

  async getHaiku(serverId, id) {
    const haikusResult = await this.query(mysql.format('SELECT * FROM haikus WHERE ID=? AND serverID=?', [id, serverId]));
    const linesResult = await this.query(mysql.format('SELECT * FROM haikuLines WHERE haikuID=?', [id]));
    const authorsResult = await this.query(mysql.format('SELECT * FROM authors WHERE haikuID=?', [id]));
    if (haikusResult.length === 0) {
      throw new Error(`No haiku with id ${id} found in server ${serverId}`);
    } else if (authorsResult.length === 0) {
      throw new Error(`Haiku with id ${id} in server ${serverId} has no author`);
    } else {
      const haiku = haikusResult[0];
      const lines = [linesResult[0].line1, linesResult[0].line2, linesResult[0].line3];
      const authors = authorsResult.map(result => result.authorID);
      return new Haiku(haiku.ID, {
        lines,
        authors,
        timestamp: new Date(haiku.creationTimestamp),
        channel: haiku.channelID,
        server: haiku.serverID,
      });
    }
  }

  async searchHaikus(serverId, keywords) {
    validateKeywords(keywords);

    const searchResults = await this.query(`SELECT haikus.ID, haikuLines.* FROM haikuLines JOIN haikus
      ON haikuLines.haikuID = haikus.ID
      WHERE haikus.serverID = ?
      AND MATCH (haikuLines.line1, haikuLines.line2, haikuLines.line3) AGAINST (? IN BOOLEAN MODE)`, [serverId, keywords.join(' ')]);
    if (searchResults.length === 0) {
      return [];
    }
    const haikus = searchResults.map(haiku => this.getHaiku(serverId, haiku.haikuID));
    return Promise.all(haikus);
  }

  async getHaikusInServer(serverId) {
    const searchResults = await this.query('SELECT ID FROM haikus WHERE serverID = ?', [serverId]);
    if (searchResults.length === 0) {
      return [];
    }
    const haikus = searchResults.map(haiku => this.getHaiku(serverId, haiku.ID));
    return Promise.all(haikus);
  }

  async clearHaiku(serverId, id) {
    const haikusResult = await this.query(mysql.format('SELECT * FROM haikus WHERE ID=? AND serverID=?', [id, serverId]));
    if (haikusResult.length === 0) {
      throw new Error(`No haiku with id ${id} found in server ${serverId}`);
    }
    await this.query(mysql.format('DELETE FROM haikuLines WHERE haikuID=?', [id]));
    await this.query(mysql.format('DELETE FROM authors WHERE haikuID=?', [id]));
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
