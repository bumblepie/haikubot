const { Haiku } = require('../domain/types/Haiku');
const config = require('../config');
const sqlite = require('sqlite3');

class SQLiteHaikuDB {
  async init() {
    await this.createDatabase();
    await this.createTables();
  }

  /* eslint-disable class-methods-use-this */
  async close() {
    return new Promise((resolve) => {
      resolve();
    });
  }
  /* eslint-enable class-methods-use-this */

  async createDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite.Database(config.sqliteDBFile, async (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  async createTables() {
    const createHaikusTableSQL = `CREATE TABLE IF NOT EXISTS haikus
                    (ID INTEGER NOT NULL,
                    serverID VARCHAR(255) NOT NULL,
                    channelID VARCHAR(255) NOT NULL,
                    creationTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (ID));`;
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
    await this.run(createHaikusTableSQL);
    await this.run(createLinesTableSQL);
    await this.run(createAuthorsTableSQL);
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, args, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  run(sql, args) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, args, function onComplete(err) {
        if (err) {
          reject(err);
        }
        resolve(this);
      });
    });
  }

  async createHaiku(haikuInput) {
    const result = await this.run(`INSERT INTO haikus (serverID, channelID)
      values (?, ?)`, [haikuInput.serverId, haikuInput.channelId]);
    const id = result.lastID;

    const authorValues = haikuInput.authors
      .map(author => [id, haikuInput.serverId, author])
      .reduce((values, nextAuthorValues) => [...values, ...nextAuthorValues], []);
    const authorValuesPlaceholders = haikuInput.authors
      .map(() => '(?, ?, ?)')
      .join(',');

    await this.run(`INSERT INTO authors (haikuID, haikuServerID, authorID)
      values ${authorValuesPlaceholders}`, authorValues);

    const lineValues = haikuInput.lines
      .map((line, index) => [id, haikuInput.serverId, index, line])
      .reduce((values, nextLineValues) => [...values, ...nextLineValues], []);
    const lineValuesPlaceholders = haikuInput.lines
      .map(() => '(?, ?, ?, ?)')
      .join(',');

    await this.run(`INSERT INTO haikuLines (haikuID, haikuServerID, lineIndex, content)
      values ${lineValuesPlaceholders}`, lineValues);

    return this.getHaiku(haikuInput.serverId, id);
  }

  async getHaiku(serverId, id) {
    const haikusResult = await this.query('SELECT * FROM haikus WHERE ID=? AND serverID=?', [id, serverId]);
    const linesResult = await this.query('SELECT * FROM haikuLines WHERE haikuID=? AND haikuServerID=?', [id, serverId]);
    const authorsResult = await this.query('SELECT * FROM authors WHERE haikuID=? AND haikuServerID=?', [id, serverId]);
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
    await this.run('DELETE FROM haikuLines WHERE haikuID=? AND haikuServerID=?', [id, serverId]);
    await this.run('DELETE FROM authors WHERE haikuID=? AND haikuServerID=?', [id, serverId]);
    await this.run('DELETE FROM haikus WHERE ID=? AND serverID=?', [id, serverId]);
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
  /* eslint-ensable class-methods-use-this */
}

exports.SQLiteHaikuDB = SQLiteHaikuDB;
