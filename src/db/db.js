// db/db.js
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
require('dotenv').config();

const rawDbFile = process.env.DB_FILE && process.env.DB_FILE.trim().replace(/^['"]|['"]$/g, '');
const DB_FILE = path.resolve(rawDbFile || path.join(__dirname, '..', 'data', 'app.db'));
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
console.log('[SQLite] Using database file:', DB_FILE);

const sqlite3 = require('sqlite3').verbose();

const dbReady = new Promise((resolve, reject) => {
  const db = new sqlite3.Database(
    DB_FILE,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) return reject(err);
      resolve(db); // ✅ return the db instance!
    }
  );
});


async function run(sql, params = []) {
  const db = await dbReady;
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}



// usage
async function get(sql, params = []) {
  const db = await dbReady;        // now this is the actual db object
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}


async function all(sql, params = []) {
  const db = await dbReady;
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function migrate() {
  // serialize via explicit transaction so nothing interleaves
  await run(`PRAGMA foreign_keys = ON;`);
  await run(`PRAGMA journal_mode = WAL;`);
  await run(`PRAGMA busy_timeout = 5000;`);

  await run('BEGIN');
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName   TEXT NOT NULL,
        lastName    TEXT NOT NULL,
        email       TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        role        TEXT NOT NULL DEFAULT 'user',
        apiCalls    INTEGER NOT NULL DEFAULT 0,
        createdAt   TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Expression index for case-insensitive uniqueness (fallback handled below)
    try {
      await run(`CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_lower ON Users(LOWER(email));`);
    } catch (_) {
      await run(`CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);`);
    }

    await run(`
      CREATE TABLE IF NOT EXISTS Videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title      TEXT NOT NULL,
        videoUrl   TEXT,
        transcript TEXT,
        summary    TEXT,
        userId     INTEGER NOT NULL,
        createdAt  TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
      );
    `);
    await run(`CREATE INDEX IF NOT EXISTS idx_videos_userId ON Videos(userId);`);

    // Seed admin deterministically
    const adminEmail = 'admin@admin.admin';
    const existing = await get(`SELECT id FROM Users WHERE LOWER(email) = LOWER(?)`, [adminEmail]);
    if (!existing) {
      const hash = await bcrypt.hash('admin', 10);
      await run(
        `INSERT INTO Users (firstName, lastName, email, passwordHash, role, apiCalls)
         VALUES (?, ?, ?, ?, ?, 0)`,
        ['admin', 'admin', adminEmail.toLowerCase(), hash, 'admin']
      );
      console.log('[SQLite] Admin user created.');
    }

    await run('COMMIT');
  } catch (e) {
    await run('ROLLBACK');
    throw e;
  }
}

module.exports = { run, get, all, migrate };
