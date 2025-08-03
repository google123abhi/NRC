const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { initializeDatabase } = require('./database/init');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const medicalRecordRoutes = require('./routes/medicalRecords');
const bedRoutes = require('./routes/beds');
const visitRoutes = require('./routes/visits');
const notificationRoutes = require('./routes/notifications');
const workerRoutes = require('./routes/workers');
const anganwadiRoutes = require('./routes/anganwadis');
const surveyRoutes = require('./routes/surveys');
const treatmentRoutes = require('./routes/treatments');
const aiRoutes = require('./routes/ai');
const bedRequestRoutes = require('./routes/bedRequests');
const medicalRecordRoutes = require('./routes/medicalRecords');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database with proper error handling
try {
  console.log('🔄 Initializing NRC Management Database...');
  initializeDatabase();
  console.log('✅ Database initialization completed successfully');
  console.log('📊 Sample data loaded for testing');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/anganwadis', anganwadiRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bed-requests', bedRequestRoutes);
app.use('/api/medical-records', medicalRecordRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: 'SQLite Connected & Initialized',
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
  console.log(`💾 Database: SQLite with Full Schema (Persistent Storage)`);
  console.log(`📡 API Endpoints: /api/patients, /api/anganwadis, /api/workers, /api/beds, /api/notifications`);
});

module.exports = app;