const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get medical records for a patient
router.get('/patient/:patientId', (req, res) => {
  const query = `
    SELECT * FROM medical_records 
    WHERE patient_id = ? 
    ORDER BY visit_date DESC
  `;
  
  db.all(query, [req.params.patientId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Parse JSON fields
    const records = rows.map(row => ({
      ...row,
      symptoms: row.symptoms ? JSON.parse(row.symptoms) : [],
      diagnosis: row.diagnosis ? JSON.parse(row.diagnosis) : [],
      treatment: row.treatment ? JSON.parse(row.treatment) : [],
      medications: row.medications ? JSON.parse(row.medications) : [],
      supplements: row.supplements ? JSON.parse(row.supplements) : []
    }));
    
    res.json(records);
  });
});

// Create new medical record
router.post('/', [
  body('patient_id').notEmpty().withMessage('Patient ID is required'),
  body('visit_type').isIn(['routine', 'emergency', 'follow_up', 'admission', 'discharge']).withMessage('Valid visit type is required'),
  body('weight').isFloat({ min: 0 }).withMessage('Valid weight is required'),
  body('height').isFloat({ min: 0 }).withMessage('Valid height is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const recordData = {
    id: uuidv4(),
    ...req.body,
    symptoms: JSON.stringify(req.body.symptoms || []),
    diagnosis: JSON.stringify(req.body.diagnosis || []),
    treatment: JSON.stringify(req.body.treatment || []),
    medications: JSON.stringify(req.body.medications || []),
    supplements: JSON.stringify(req.body.supplements || [])
  };

  const query = `
    INSERT INTO medical_records (
      id, patient_id, visit_date, visit_type, health_worker_id, weight, height,
      temperature, blood_pressure, pulse, respiratory_rate, oxygen_saturation,
      symptoms, diagnosis, treatment, medications, appetite, food_intake, supplements,
      diet_plan, hemoglobin, blood_sugar, protein_level, notes,
      next_visit_date, follow_up_required
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    recordData.id, recordData.patient_id, recordData.visit_date || new Date().toISOString().split('T')[0],
    recordData.visit_type, recordData.health_worker_id, recordData.weight, recordData.height,
    recordData.temperature, recordData.blood_pressure, recordData.pulse,
    recordData.respiratory_rate, recordData.oxygen_saturation, recordData.symptoms,
    recordData.diagnosis, recordData.treatment, recordData.medications,
    recordData.appetite, recordData.food_intake, recordData.supplements,
    recordData.diet_plan, recordData.hemoglobin, recordData.blood_sugar,
    recordData.protein_level, recordData.notes, recordData.next_visit_date,
    recordData.follow_up_required || 0
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Update patient's last visit date
    const updatePatientQuery = `
      UPDATE patients 
      SET last_visit_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.run(updatePatientQuery, [recordData.visit_date || new Date().toISOString().split('T')[0], recordData.patient_id]);

    res.status(201).json({ 
      message: 'Medical record created successfully', 
      id: recordData.id 
    });
  });
});

module.exports = router;