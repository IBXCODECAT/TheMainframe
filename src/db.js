const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'mainframe.db'));

// --- INITIALIZE TABLES ---
// We use a "Global" table for simple values and specific tables for complex games
db.prepare(`
    CREATE TABLE IF NOT EXISTS state (
        key TEXT PRIMARY KEY, 
        value TEXT
    )
`).run();

// === Helper Functions ===

const MainframeDB = {
  // Get a piece of state
  // Get a piece of state
    get: (key) => {
        const row = db.prepare('SELECT value FROM state WHERE key = ?').get(key);
        return row ? JSON.parse(row.value) : null;
    },

    // Set a piece of state
    set: (key, value) => {
        const jsonValue = JSON.stringify(value);
        db.prepare('INSERT OR REPLACE INTO state (key, value) VALUES (?, ?)').run(key, jsonValue);
    },

    // Initialize default state if it doesn't exist
    init: (key, defaultValue) => {
        const existing = MainframeDB.get(key);
        if (!existing) {
            MainframeDB.set(key, defaultValue);
        }
    }
}

module.exports = MainframeDB;
