const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const DB_FILE = process.env.DB_FILE || './data/app.db';
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(DB_FILE);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function migrate() {
  await run(`PRAGMA foreign_keys = ON;`);

  await run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName  TEXT NOT NULL,
      email     TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role      TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  await run(`CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);`);

  await run(`
    CREATE TABLE IF NOT EXISTS Videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,            -- "name it" (a human-readable title)
      videoUrl TEXT,                  -- optional (if you store a URL)
      transcript TEXT,                -- transcript from Whisper
      summary TEXT,                   -- summary from DeepSeek
      userId INTEGER NOT NULL,        -- owner (foreign key)
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
  `);
  await run(`CREATE INDEX IF NOT EXISTS idx_videos_userId ON Videos(userId);`);
}

module.exports = { db, run, get, all, migrate };
