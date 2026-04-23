const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        db.serialize(() => {
            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                auth_provider TEXT DEFAULT 'local',
                google_id TEXT UNIQUE
            )`);

            // Assets Table
            db.run(`CREATE TABLE IF NOT EXISTS assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                filename TEXT NOT NULL,
                original_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                mime_type TEXT,
                size INTEGER,
                upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'pending',
                protection_status TEXT DEFAULT 'unprotected',
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            // Add protection_status column if it doesn't exist
            db.run(`ALTER TABLE assets ADD COLUMN protection_status TEXT DEFAULT 'unprotected'`, (err) => { /* ignore if exists */ });

            // Scan Reports Table
            db.run(`CREATE TABLE IF NOT EXISTS scan_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER NOT NULL,
                risk_score INTEGER DEFAULT 0,
                malware_score INTEGER DEFAULT 0,
                copyright_score INTEGER DEFAULT 0,
                privacy_score INTEGER DEFAULT 0,
                flagged_issues TEXT,
                scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (asset_id) REFERENCES assets (id)
            )`);

            // Add sub-score columns to scan_reports if they don't exist
            db.run(`ALTER TABLE scan_reports ADD COLUMN malware_score INTEGER DEFAULT 0`, (err) => {});
            db.run(`ALTER TABLE scan_reports ADD COLUMN copyright_score INTEGER DEFAULT 0`, (err) => {});
            db.run(`ALTER TABLE scan_reports ADD COLUMN privacy_score INTEGER DEFAULT 0`, (err) => {});

            // Audit Logs Table
            db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);
        });
    }
});

module.exports = db;
