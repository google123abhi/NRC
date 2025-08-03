const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get all visits
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all visits from database...');
    const query = `
      SELECT v.*, p.name as patient_name, p.type as patient_type, u.name as health_worker_name
      FROM visits v
      JOIN patients p ON v.patient_id = p.id
      LEFT JOIN users u ON v.health_worker_id = u.employee_id
      ORDER BY v.scheduled_date DESC
    `;
    
    const rows = await getAllRows(query);
    
    // Transform to frontend format
    const visits = rows.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      healthWorkerId: row.health_worker_id,
      scheduledDate: row.scheduled_date,
      actualDate: row.actual_date,
      status: row.status,
      notes: row.notes,
      patientName: row.patient_name,
      patientType: row.patient_type,
      healthWorkerName: row.health_worker_name
    }));
    
    console.log(`✅ Successfully retrieved ${visits.length} visits from database`);
    res.json(visits);
  } catch (err) {
    console.error('❌ Error fetching visits:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new visit
router.post('/', [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('healthWorkerId').notEmpty().withMessage('Health worker ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('📝 Received visit data from frontend:', JSON.stringify(req.body, null, 2));

    const visitData = {
      id: uuidv4(),
      patient_id: req.body.patientId,
      health_worker_id: req.body.healthWorkerId,
      scheduled_date: req.body.scheduledDate,
      actual_date: req.body.actualDate,
      status: req.body.status || 'scheduled',
      notes: req.body.notes
    };

    console.log('🔄 Processing visit data for database storage:', JSON.stringify(visitData, null, 2));

    const query = `
      INSERT INTO visits (id, patient_id, health_worker_id, scheduled_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      visitData.id, visitData.patient_id, visitData.health_worker_id,
      visitData.scheduled_date, visitData.status, visitData.notes
    ];

    console.log('💾 Executing database INSERT query...');
    await runQuery(query, values);
    console.log('✅ Visit successfully saved to database with ID:', visitData.id);
    
    res.status(201).json({ 
      message: 'Visit created successfully', 
      id: visitData.id,
      visit: visitData
    });
  } catch (err) {
    console.error('❌ Error creating visit:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update visit
router.put('/:id', async (req, res) => {
  try {
    console.log(`📝 Updating visit ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    const updates = req.body;
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    const query = `UPDATE visits SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    console.log('💾 Executing database UPDATE query...');
    const result = await runQuery(query, values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    console.log('✅ Visit successfully updated in database');
    res.json({ message: 'Visit updated successfully' });
  } catch (err) {
    console.error('❌ Error updating visit:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;