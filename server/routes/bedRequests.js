const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get all bed requests
router.get('/', (req, res) => {
  const query = `
    SELECT br.*, 
           p.name as patient_name,
           p.type as patient_type,
           p.nutrition_status,
           u1.name as requested_by_name,
           u2.name as reviewed_by_name
    FROM bed_requests br
    JOIN patients p ON br.patient_id = p.id
    LEFT JOIN users u1 ON br.requested_by = u1.employee_id
    LEFT JOIN users u2 ON br.reviewed_by = u2.employee_id
    ORDER BY br.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create new bed request
router.post('/', [
  body('patient_id').notEmpty().withMessage('Patient ID is required'),
  body('urgency_level').isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid urgency level is required'),
  body('medical_justification').notEmpty().withMessage('Medical justification is required'),
  body('current_condition').notEmpty().withMessage('Current condition is required'),
  body('estimated_stay_duration').isInt({ min: 1 }).withMessage('Valid estimated stay duration is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  console.log('Received bed request data on server:', req.body);

  const requestData = {
    id: uuidv4(),
    patient_id: req.body.patientId,
    requested_by: req.body.requestedBy,
    request_date: req.body.requestDate || new Date().toISOString().split('T')[0],
    urgency_level: req.body.urgencyLevel,
    medical_justification: req.body.medicalJustification,
    current_condition: req.body.currentCondition,
    estimated_stay_duration: req.body.estimatedStayDuration,
    special_requirements: req.body.specialRequirements,
    status: req.body.status || 'pending'
  };

  console.log('Processed bed request data for database:', requestData);

  const query = `
    INSERT INTO bed_requests (
      id, patient_id, requested_by, request_date, urgency_level,
      medical_justification, current_condition, estimated_stay_duration,
      special_requirements, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    requestData.id, requestData.patient_id, requestData.requested_by,
    requestData.request_date,
    requestData.urgency_level, requestData.medical_justification,
    requestData.current_condition, requestData.estimated_stay_duration,
    requestData.special_requirements, requestData.status
  ];

  console.log('Executing database query with values:', values);
  db.run(query, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Bed request saved to database successfully');
    res.status(201).json({ 
      message: 'Bed request created successfully', 
      id: requestData.id,
      bedRequest: requestData
    });
  });
});

// Update bed request
router.put('/:id', (req, res) => {
  const updates = req.body;
  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  const query = `UPDATE bed_requests SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Bed request not found' });
    }
    res.json({ message: 'Bed request updated successfully' });
  });
});

module.exports = router;