const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get all visits
router.get('/', (req, res) => {
  const query = `
    SELECT v.*, p.name as patient_name, p.type as patient_type, u.name as health_worker_name
    FROM visits v
    JOIN patients p ON v.patient_id = p.id
    LEFT JOIN users u ON v.health_worker_id = u.employee_id
    ORDER BY v.scheduled_date DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create new visit
router.post('/', [
  body('patient_id').notEmpty().withMessage('Patient ID is required'),
  body('scheduled_date').isISO8601().withMessage('Valid scheduled date is required'),
  body('health_worker_id').notEmpty().withMessage('Health worker ID is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  console.log('Received visit data on server:', req.body);

  const visitData = {
    id: uuidv4(),
    patient_id: req.body.patientId,
    health_worker_id: req.body.healthWorkerId,
    scheduled_date: req.body.scheduledDate,
    actual_date: req.body.actualDate,
    status: req.body.status || 'scheduled',
    notes: req.body.notes
  };

  console.log('Processed visit data for database:', visitData);

  const query = `
    INSERT INTO visits (id, patient_id, health_worker_id, scheduled_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    visitData.id, visitData.patient_id, visitData.health_worker_id,
    visitData.scheduled_date, visitData.status, visitData.notes
  ];

  console.log('Executing database query with values:', values);
  db.run(query, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Visit saved to database successfully');
    res.status(201).json({ 
      message: 'Visit created successfully', 
      id: visitData.id,
      visit: visitData
    });
  });
});

// Update visit
router.put('/:id', (req, res) => {
  const updates = req.body;
  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  const query = `UPDATE visits SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }
    res.json({ message: 'Visit updated successfully' });
  });
});

module.exports = router;