const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'nrc_management.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('📁 Connected to SQLite database at:', DB_PATH);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

const initializeDatabase = () => {
  console.log('🔄 Initializing database schema...');
  
  // Read and execute schema file
  const schemaPath = path.join(__dirname, 'schema.sql');
  
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    // Execute each statement
    statements.forEach((statement, index) => {
      db.run(statement + ';', (err) => {
        if (err) {
          console.error(`❌ Error executing statement ${index + 1}:`, err.message);
        }
      });
    });
    
    console.log('✅ Database schema initialized successfully');
    console.log('📊 Sample data loaded');
  } else {
    console.error('❌ Schema file not found:', schemaPath);
  }
};

// Helper function to run queries with promises
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Database query error:', err.message);
        reject(err);
      } else {
        console.log('✅ Database query executed successfully');
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Helper function to get single row
const getRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('❌ Database get error:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to get all rows
const getAllRows = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('❌ Database select error:', err.message);
        reject(err);
      } else {
        console.log(`✅ Retrieved ${rows.length} rows from database`);
        resolve(rows);
      }
    });
  });
};

module.exports = { 
  db, 
  initializeDatabase, 
  runQuery, 
  getRow, 
  getAllRows 
};