const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Ensure database directory exists
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Ensure uploads directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
const schemaFile = path.resolve(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaFile, 'utf8');
db.exec(schemaSql);

module.exports = db;
