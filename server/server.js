const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection, initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const medicalRecordRoutes = require('./routes/medicalRecords');
const bedRoutes = require('./routes/beds');
const visitRoutes = require('./routes/visits');
const notificationRoutes = require('./routes/notifications');
const workerRoutes = require('./routes/workers');
const anganwadiRoutes = require('./routes/anganwadis');
const bedRequestRoutes = require('./routes/bedRequests');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize MySQL database connection
const initializeApp = async () => {
  try {
    console.log('🔄 Initializing NRC Management MySQL Database...');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to MySQL database');
      process.exit(1);
    }
    
    // Initialize database schema
    await initializeDatabase();
    
    console.log('✅ MySQL database initialization completed successfully');
    console.log('📊 Sample data available for testing');
  } catch (error) {
    console.error('❌ MySQL database initialization failed:', error);
    process.exit(1);
  }
};

// Initialize database
initializeApp();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/anganwadis', anganwadiRoutes);
app.use('/api/bed-requests', bedRequestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '4.0.0',
    database: 'MySQL Connected & Initialized',
    environment: NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 NRC Management Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`💾 Database: MySQL with Full Schema (Persistent Storage)`);
  console.log(`📡 API Endpoints: /api/patients, /api/anganwadis, /api/workers, /api/beds, /api/notifications`);
  console.log(`👑 Admin Panel: Login with ADMIN001 / admin / admin123`);
});

module.exports = app;