const sqlite = require('sqlite3');
const { Haiku } = require('../domain/types/Haiku');
const { validateKeywords } = require('./common');

class SQLiteHaikuDB {
  constructor(config) {
    this.sqliteDBFile = config.sqliteDBFile;
  }

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
      this.db = new sqlite.Database(this.sqliteDBFile, async (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  async createTables() {
    const createLinesTableSQL = `CREATE VIRTUAL TABLE IF NOT EXISTS haikuLines
                    USING FTS5 (line1, line2, line3);`;
    const createHaikusTableSQL = `CREATE TABLE IF NOT EXISTS haikus
                    (ID INTEGER NOT NULL,
                    serverID VARCHAR(255) NOT NULL,
                    channelID VARCHAR(255) NOT NULL,
                    creationTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    lines INTEGER NOT NULL,
                    PRIMARY KEY (ID),
                    FOREIGN KEY(lines)
                      REFERENCES haikuLines(rowid));`;
    const createAuthorsTableSQL = `CREATE TABLE IF NOT EXISTS authors
                    (haikuID INTEGER NOT NULL,
                    authorID VARCHAR(255) NOT NULL,
                    PRIMARY KEY (haikuID, authorID),
                    FOREIGN KEY (haikuID)
                      REFERENCES haikus(ID));`;
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
    const linesResult = await this.run(`INSERT INTO haikuLines (line1, line2, line3)
      values (?, ?, ?)`, haikuInput.lines);
    const linesID = linesResult.lastID;

    const result = await this.run(`INSERT INTO haikus (serverID, channelID, lines)
      values (?, ?, ?)`, [haikuInput.serverId, haikuInput.channelId, linesID]);
    const id = result.lastID;

    const authorValues = haikuInput.authors
      .map(author => [id, author])
      .reduce((values, nextAuthorValues) => [...values, ...nextAuthorValues], []);
    const authorValuesPlaceholders = haikuInput.authors
      .map(() => '(?, ?)')
      .join(',');

    await this.run(`INSERT INTO authors (haikuID, authorID)
      values ${authorValuesPlaceholders}`, authorValues);

    return this.getHaiku(haikuInput.serverId, id);
  }

  async getHaiku(serverId, id) {
    const haikusResult = await this.query('SELECT * FROM haikus WHERE ID=? AND serverID=?', [id, serverId]);
    if (haikusResult.length === 0) {
      throw new Error(`No haiku with id ${id} found in server ${serverId}`);
    }
    const linesID = haikusResult[0].lines;

    const linesResult = await this.query('SELECT * FROM haikuLines WHERE rowid = ?', [linesID]);
    if (linesResult.length === 0) {
      throw new Error(`Haiku with id ${id} in server ${serverId} has no content`);
    }

    const authorsResult = await this.query('SELECT * FROM authors WHERE haikuID=?', [id]);
    if (authorsResult.length === 0) {
      throw new Error(`Haiku with id ${id} in server ${serverId} has no author`);
    }

    const haiku = haikusResult[0];
    const lines = [linesResult[0].line1, linesResult[0].line2, linesResult[0].line3];
    const authors = authorsResult.map(result => result.authorID);
    return new Haiku(haiku.ID, {
      lines,
      authors,
      // Ensure timestamp is in UTC time - SQLite returns YYYY-MM-DD HH:MM:SS.SSS
      timestamp: new Date(`${haiku.creationTimestamp} UTC`),
      channel: haiku.channelID,
      server: haiku.serverID,
    });
  }

  async searchHaikus(keywords) {
    validateKeywords(keywords);

    // Lower case the keywords to avoid conflicts with SQLite FTS reserved words such as 'AND'
    // Search is case insensitive so it shoudl not affect results
    const lowercaseKeywords = keywords.map(keyword => keyword.toLowerCase());

    const searchResults = await this.query('SELECT rowid FROM haikuLines WHERE haikuLines MATCH ? ORDER BY rank', [lowercaseKeywords.join(' OR ')]);
    if (searchResults.length === 0) {
      return [];
    }
    const lineIDs = searchResults.map(result => result.rowid);
    const lineIDPlaceholders = lineIDs.map(() => '?')
      .join(', ');
    const haikusResult = await this.query(`SELECT * FROM haikus WHERE lines IN (${lineIDPlaceholders})`, lineIDs);
    const haikus = haikusResult.map(haiku => this.getHaiku(haiku.serverID, haiku.ID));
    return Promise.all(haikus);
  }

  async clearHaiku(serverId, id) {
    const haikusResult = await this.query('SELECT * FROM haikus WHERE ID=? AND serverID=?', [id, serverId]);
    if (haikusResult.length === 0) {
      throw new Error(`No haiku with id ${id} found in server ${serverId}`);
    }
    const linesID = haikusResult[0].lines;

    await this.run('DELETE FROM authors WHERE haikuID=?', [id]);
    await this.run('DELETE FROM haikus WHERE ID=? AND serverID=?', [id, serverId]);
    await this.run('DELETE FROM haikuLines WHERE rowID=?', [linesID]);
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
