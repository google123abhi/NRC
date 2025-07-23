const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT p.*, b.number as bed_number, b.ward as bed_ward
      FROM patients p
      LEFT JOIN beds b ON p.bed_id = b.id
      WHERE p.is_active = 1
      ORDER BY p.created_at DESC
    `;
    
    const rows = await getAllRows(query);
    
    // Parse JSON fields
    const patients = rows.map(row => ({
      ...row,
      medical_history: row.medical_history ? JSON.parse(row.medical_history) : [],
      symptoms: row.symptoms ? JSON.parse(row.symptoms) : [],
      documents: row.documents ? JSON.parse(row.documents) : [],
      photos: row.photos ? JSON.parse(row.photos) : [],
      nutritional_deficiency: row.nutritional_deficiency ? JSON.parse(row.nutritional_deficiency) : []
    }));
    
    res.json(patients);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT p.*, b.number as bed_number, b.ward as bed_ward
      FROM patients p
      LEFT JOIN beds b ON p.bed_id = b.id
      WHERE p.id = ? AND p.is_active = 1
    `;
    
    const row = await getRow(query, [req.params.id]);
    
    if (!row) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Parse JSON fields
    const patient = {
      ...row,
      medical_history: row.medical_history ? JSON.parse(row.medical_history) : [],
      symptoms: row.symptoms ? JSON.parse(row.symptoms) : [],
      documents: row.documents ? JSON.parse(row.documents) : [],
      photos: row.photos ? JSON.parse(row.photos) : [],
      nutritional_deficiency: row.nutritional_deficiency ? JSON.parse(row.nutritional_deficiency) : []
    };
    
    res.json(patient);
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new patient
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 0 }).withMessage('Valid age is required'),
  body('type').isIn(['child', 'pregnant']).withMessage('Type must be child or pregnant'),
  body('contact_number').notEmpty().withMessage('Contact number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('weight').isFloat({ min: 0 }).withMessage('Valid weight is required'),
  body('height').isFloat({ min: 0 }).withMessage('Valid height is required'),
  body('nutrition_status').isIn(['normal', 'malnourished', 'severely_malnourished']).withMessage('Valid nutrition status is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const patientData = {
      id: uuidv4(),
      registration_number: `NRC${Date.now()}`,
      ...req.body,
      medical_history: JSON.stringify(req.body.medical_history || []),
      symptoms: JSON.stringify(req.body.symptoms || []),
      documents: JSON.stringify(req.body.documents || []),
      photos: JSON.stringify(req.body.photos || []),
      nutritional_deficiency: JSON.stringify(req.body.nutritional_deficiency || [])
    };

    const query = `
      INSERT INTO patients (
        id, registration_number, aadhaar_number, name, age, type, pregnancy_week,
        contact_number, emergency_contact, address, weight, height, blood_pressure,
        temperature, hemoglobin, nutrition_status, medical_history, symptoms,
        documents, photos, remarks, risk_score, nutritional_deficiency,
        registered_by, registration_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      patientData.id, patientData.registration_number, patientData.aadhaar_number,
      patientData.name, patientData.age, patientData.type, patientData.pregnancy_week,
      patientData.contact_number, patientData.emergency_contact, patientData.address,
      patientData.weight, patientData.height, patientData.blood_pressure,
      patientData.temperature, patientData.hemoglobin, patientData.nutrition_status,
      patientData.medical_history, patientData.symptoms, patientData.documents,
      patientData.photos, patientData.remarks, patientData.risk_score,
      patientData.nutritional_deficiency, patientData.registered_by,
      patientData.registration_date || new Date().toISOString().split('T')[0]
    ];

    await runQuery(query, values);

    // Create notification for high-risk patients
    if (patientData.risk_score > 80 || patientData.nutrition_status === 'severely_malnourished') {
      const notificationQuery = `
        INSERT INTO notifications (id, user_role, type, title, message, priority, action_required)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await runQuery(notificationQuery, [
        uuidv4(),
        'supervisor',
        'high_risk_alert',
        'High Risk Patient Registered',
        `New high-risk patient ${patientData.name} has been registered with ${patientData.nutrition_status} status.`,
        'high',
        1
      ]);
    }

    res.status(201).json({ 
      message: 'Patient created successfully', 
      id: patientData.id 
    });
  } catch (err) {
    console.error('Error creating patient:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Convert arrays to JSON strings
    if (updates.medical_history) updates.medical_history = JSON.stringify(updates.medical_history);
    if (updates.symptoms) updates.symptoms = JSON.stringify(updates.symptoms);
    if (updates.documents) updates.documents = JSON.stringify(updates.documents);
    if (updates.photos) updates.photos = JSON.stringify(updates.photos);
    if (updates.nutritional_deficiency) updates.nutritional_deficiency = JSON.stringify(updates.nutritional_deficiency);

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    const query = `UPDATE patients SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const result = await runQuery(query, values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json({ message: 'Patient updated successfully' });
  } catch (err) {
    console.error('Error updating patient:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete patient (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const query = `UPDATE patients SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const result = await runQuery(query, [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;