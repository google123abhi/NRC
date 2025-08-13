const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all patients from MySQL database...');
    
    const [rows] = await pool.execute(`
      SELECT * FROM patients 
      WHERE is_active = TRUE 
      ORDER BY created_at DESC
    `);
    
    // Transform MySQL data to frontend format
    const transformedPatients = rows.map(patient => ({
      id: patient.id,
      registrationNumber: patient.registration_number,
      aadhaarNumber: patient.aadhaar_number,
      name: patient.name,
      age: patient.age,
      type: patient.type,
      pregnancyWeek: patient.pregnancy_week,
      contactNumber: patient.contact_number,
      emergencyContact: patient.emergency_contact,
      address: patient.address,
      weight: parseFloat(patient.weight),
      height: parseFloat(patient.height),
      bloodPressure: patient.blood_pressure,
      temperature: patient.temperature ? parseFloat(patient.temperature) : null,
      hemoglobin: patient.hemoglobin ? parseFloat(patient.hemoglobin) : null,
      nutritionStatus: patient.nutrition_status,
      medicalHistory: patient.medical_history ? JSON.parse(patient.medical_history) : [],
      symptoms: patient.symptoms ? JSON.parse(patient.symptoms) : [],
      documents: patient.documents ? JSON.parse(patient.documents) : [],
      photos: patient.photos ? JSON.parse(patient.photos) : [],
      remarks: patient.remarks,
      riskScore: patient.risk_score,
      nutritionalDeficiency: patient.nutritional_deficiency ? JSON.parse(patient.nutritional_deficiency) : [],
      bedId: patient.bed_id,
      lastVisitDate: patient.last_visit_date,
      nextVisitDate: patient.next_visit_date,
      registeredBy: patient.registered_by,
      registrationDate: patient.registration_date,
      admissionDate: patient.registration_date,
      nextVisit: patient.next_visit_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
    
    console.log(`✅ Successfully retrieved ${transformedPatients.length} patients from MySQL`);
    res.json(transformedPatients);
  } catch (err) {
    console.error('❌ Error fetching patients from MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new patient
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 0 }).withMessage('Valid age is required'),
  body('type').isIn(['child', 'pregnant']).withMessage('Type must be child or pregnant'),
  body('contactNumber').notEmpty().withMessage('Contact number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('weight').isFloat({ min: 0 }).withMessage('Valid weight is required'),
  body('height').isFloat({ min: 0 }).withMessage('Valid height is required'),
  body('nutritionStatus').isIn(['normal', 'malnourished', 'severely_malnourished']).withMessage('Valid nutrition status is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('📝 Received patient data from frontend:', JSON.stringify(req.body, null, 2));
    
    const patientId = `PAT-${Date.now()}`;
    const registrationNumber = `NRC${Date.now()}`;
    
    // Transform frontend data to MySQL format
    const patientData = {
      id: patientId,
      registration_number: registrationNumber,
      aadhaar_number: req.body.aadhaarNumber || null,
      name: req.body.name,
      age: req.body.age,
      type: req.body.type,
      pregnancy_week: req.body.pregnancyWeek || null,
      contact_number: req.body.contactNumber,
      emergency_contact: req.body.emergencyContact || req.body.contactNumber,
      address: req.body.address,
      weight: req.body.weight,
      height: req.body.height,
      blood_pressure: req.body.bloodPressure || null,
      temperature: req.body.temperature || null,
      hemoglobin: req.body.hemoglobin || null,
      nutrition_status: req.body.nutritionStatus,
      medical_history: JSON.stringify(req.body.medicalHistory || []),
      symptoms: JSON.stringify(req.body.symptoms || []),
      documents: JSON.stringify(req.body.documents || []),
      photos: JSON.stringify(req.body.photos || []),
      remarks: req.body.remarks || null,
      risk_score: req.body.riskScore || 0,
      nutritional_deficiency: JSON.stringify(req.body.nutritionalDeficiency || []),
      registered_by: req.body.registeredBy || 'SYSTEM'
    };

    console.log('🔄 Processing patient data for MySQL storage:', JSON.stringify(patientData, null, 2));

    // Insert into MySQL database
    await pool.execute(`
      INSERT INTO patients (
        id, registration_number, aadhaar_number, name, age, type, pregnancy_week,
        contact_number, emergency_contact, address, weight, height, blood_pressure,
        temperature, hemoglobin, nutrition_status, medical_history, symptoms,
        documents, photos, remarks, risk_score, nutritional_deficiency, registered_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      patientData.id, patientData.registration_number, patientData.aadhaar_number,
      patientData.name, patientData.age, patientData.type, patientData.pregnancy_week,
      patientData.contact_number, patientData.emergency_contact, patientData.address,
      patientData.weight, patientData.height, patientData.blood_pressure,
      patientData.temperature, patientData.hemoglobin, patientData.nutrition_status,
      patientData.medical_history, patientData.symptoms, patientData.documents,
      patientData.photos, patientData.remarks, patientData.risk_score,
      patientData.nutritional_deficiency, patientData.registered_by
    ]);
    
    console.log('✅ Patient successfully saved to MySQL database with ID:', patientId);

    // Create notification for high-risk patients
    if (patientData.risk_score > 80 || patientData.nutrition_status === 'severely_malnourished') {
      console.log('🚨 Creating high-risk patient notification...');
      
      const notificationId = `NOT-${Date.now()}`;
      await pool.execute(`
        INSERT INTO notifications (id, user_role, type, title, message, priority, action_required)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        notificationId,
        'supervisor',
        'high_risk_alert',
        'High Risk Patient Registered',
        `New high-risk patient ${patientData.name} has been registered with ${patientData.nutrition_status} status.`,
        'high',
        true
      ]);
      
      console.log('✅ High-risk notification created in MySQL');
    }

    res.status(201).json({ 
      message: 'Patient created successfully', 
      id: patientId,
      registrationNumber: registrationNumber
    });
  } catch (err) {
    console.error('❌ Error creating patient in MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    console.log(`📝 Updating patient ${req.params.id} in MySQL with data:`, JSON.stringify(req.body, null, 2));
    
    const updates = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (updates.name) { updateFields.push('name = ?'); updateValues.push(updates.name); }
    if (updates.age) { updateFields.push('age = ?'); updateValues.push(updates.age); }
    if (updates.contactNumber) { updateFields.push('contact_number = ?'); updateValues.push(updates.contactNumber); }
    if (updates.address) { updateFields.push('address = ?'); updateValues.push(updates.address); }
    if (updates.weight) { updateFields.push('weight = ?'); updateValues.push(updates.weight); }
    if (updates.height) { updateFields.push('height = ?'); updateValues.push(updates.height); }
    if (updates.nutritionStatus) { updateFields.push('nutrition_status = ?'); updateValues.push(updates.nutritionStatus); }
    if (updates.medicalHistory) { updateFields.push('medical_history = ?'); updateValues.push(JSON.stringify(updates.medicalHistory)); }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(req.params.id);

    console.log('💾 Executing MySQL update...');
    const [result] = await pool.execute(`
      UPDATE patients SET ${updateFields.join(', ')} WHERE id = ?
    `, updateValues);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    console.log('✅ Patient successfully updated in MySQL database');
    res.json({ message: 'Patient updated successfully' });
  } catch (err) {
    console.error('❌ Error updating patient in MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;