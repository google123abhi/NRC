const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get all bed requests
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all bed requests from database...');
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
    
    const rows = await getAllRows(query);
    
    // Transform to frontend format
    const bedRequests = rows.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      requestedBy: row.requested_by,
      requestDate: row.request_date,
      urgencyLevel: row.urgency_level,
      medicalJustification: row.medical_justification,
      currentCondition: row.current_condition,
      estimatedStayDuration: row.estimated_stay_duration,
      specialRequirements: row.special_requirements,
      status: row.status,
      reviewedBy: row.reviewed_by,
      reviewDate: row.review_date,
      reviewComments: row.review_comments,
      hospitalReferral: row.hospital_referral ? JSON.parse(row.hospital_referral) : null,
      patientName: row.patient_name,
      patientType: row.patient_type,
      nutritionStatus: row.nutrition_status,
      requestedByName: row.requested_by_name,
      reviewedByName: row.reviewed_by_name
    }));
    
    console.log(`✅ Successfully retrieved ${bedRequests.length} bed requests from database`);
    res.json(bedRequests);
  } catch (err) {
    console.error('❌ Error fetching bed requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new bed request
router.post('/', [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('urgencyLevel').isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid urgency level is required'),
  body('medicalJustification').notEmpty().withMessage('Medical justification is required'),
  body('currentCondition').notEmpty().withMessage('Current condition is required'),
  body('estimatedStayDuration').isInt({ min: 1 }).withMessage('Valid estimated stay duration is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('📝 Received bed request data from frontend:', JSON.stringify(req.body, null, 2));

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

    console.log('🔄 Processing bed request data for database storage:', JSON.stringify(requestData, null, 2));

    const query = `
      INSERT INTO bed_requests (
        id, patient_id, requested_by, request_date, urgency_level,
        medical_justification, current_condition, estimated_stay_duration,
        special_requirements, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      requestData.id, requestData.patient_id, requestData.requested_by,
      requestData.request_date, requestData.urgency_level, requestData.medical_justification,
      requestData.current_condition, requestData.estimated_stay_duration,
      requestData.special_requirements, requestData.status
    ];

    console.log('💾 Executing database INSERT query...');
    await runQuery(query, values);
    console.log('✅ Bed request successfully saved to database with ID:', requestData.id);
    
    res.status(201).json({ 
      message: 'Bed request created successfully', 
      id: requestData.id,
      bedRequest: requestData
    });
  } catch (err) {
    console.error('❌ Error creating bed request:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update bed request
router.put('/:id', async (req, res) => {
  try {
    console.log(`📝 Updating bed request ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    const updates = req.body;
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    const query = `UPDATE bed_requests SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    console.log('💾 Executing database UPDATE query...');
    const result = await runQuery(query, values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Bed request not found' });
    }
    
    console.log('✅ Bed request successfully updated in database');
    res.json({ message: 'Bed request updated successfully' });
  } catch (err) {
    console.error('❌ Error updating bed request:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;