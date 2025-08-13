const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nrc_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    console.log('🔄 Testing MySQL database connection...');
    console.log('📍 Database Config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    console.log('📊 Database:', dbConfig.database);
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('📈 Users in database:', rows[0].count);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error.message);
    console.error('💡 Make sure MySQL is running and credentials are correct');
    return false;
  }
};

// Initialize database with schema
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing MySQL database schema...');
    
    const connection = await pool.getConnection();
    
    // Check if tables exist
    const [tables] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'users'
    `, [dbConfig.database]);
    
    if (tables[0].count === 0) {
      console.log('📊 Database tables not found. Please run the schema file manually.');
      console.log('💡 Execute: mysql -u root -p < server/database/mysql-schema.sql');
    } else {
      console.log('✅ Database schema already exists');
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};