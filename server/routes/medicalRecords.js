const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get medical records for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    console.log(`📊 Fetching medical records for patient ${req.params.patientId} from database...`);
    const query = `
      SELECT * FROM medical_records 
      WHERE patient_id = ? 
      ORDER BY visit_date DESC
    `;
    
    const rows = await getAllRows(query, [req.params.patientId]);
    
    // Parse JSON fields and transform to frontend format
    const records = rows.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      date: row.visit_date,
      visitType: row.visit_type,
      healthWorkerId: row.health_worker_id,
      vitals: {
        weight: row.weight,
        height: row.height,
        temperature: row.temperature,
        bloodPressure: row.blood_pressure,
        pulse: row.pulse,
        respiratoryRate: row.respiratory_rate,
        oxygenSaturation: row.oxygen_saturation
      },
      symptoms: row.symptoms ? JSON.parse(row.symptoms) : [],
      diagnosis: row.diagnosis ? JSON.parse(row.diagnosis) : [],
      treatment: row.treatment ? JSON.parse(row.treatment) : [],
      nutritionAssessment: {
        appetite: row.appetite,
        foodIntake: row.food_intake,
        supplements: row.supplements ? JSON.parse(row.supplements) : [],
        dietPlan: row.diet_plan
      },
      labResults: {
        hemoglobin: row.hemoglobin,
        bloodSugar: row.blood_sugar,
        proteinLevel: row.protein_level
      },
      notes: row.notes,
      nextVisitDate: row.next_visit_date,
      followUpRequired: row.follow_up_required === 1
    }));
    
    console.log(`✅ Successfully retrieved ${records.length} medical records from database`);
    res.json(records);
  } catch (err) {
    console.error('❌ Error fetching medical records:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new medical record
router.post('/', [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('visitType').isIn(['routine', 'emergency', 'follow_up', 'admission', 'discharge']).withMessage('Valid visit type is required'),
  body('vitals.weight').isFloat({ min: 0 }).withMessage('Valid weight is required'),
  body('vitals.height').isFloat({ min: 0 }).withMessage('Valid height is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('📝 Received medical record data from frontend:', JSON.stringify(req.body, null, 2));

    const recordData = {
      id: uuidv4(),
      patient_id: req.body.patientId,
      visit_date: req.body.date || new Date().toISOString().split('T')[0],
      visit_type: req.body.visitType,
      health_worker_id: req.body.healthWorkerId,
      weight: req.body.vitals.weight,
      height: req.body.vitals.height,
      temperature: req.body.vitals.temperature,
      blood_pressure: req.body.vitals.bloodPressure,
      pulse: req.body.vitals.pulse,
      respiratory_rate: req.body.vitals.respiratoryRate,
      oxygen_saturation: req.body.vitals.oxygenSaturation,
      symptoms: JSON.stringify(req.body.symptoms || []),
      diagnosis: JSON.stringify(req.body.diagnosis || []),
      treatment: JSON.stringify(req.body.treatment || []),
      appetite: req.body.nutritionAssessment?.appetite,
      food_intake: req.body.nutritionAssessment?.foodIntake,
      supplements: JSON.stringify(req.body.nutritionAssessment?.supplements || []),
      diet_plan: req.body.nutritionAssessment?.dietPlan,
      hemoglobin: req.body.labResults?.hemoglobin,
      blood_sugar: req.body.labResults?.bloodSugar,
      protein_level: req.body.labResults?.proteinLevel,
      notes: req.body.notes,
      next_visit_date: req.body.nextVisitDate,
      follow_up_required: req.body.followUpRequired ? 1 : 0
    };

    console.log('🔄 Processing medical record data for database storage:', JSON.stringify(recordData, null, 2));

    const query = `
      INSERT INTO medical_records (
        id, patient_id, visit_date, visit_type, health_worker_id, weight, height,
        temperature, blood_pressure, pulse, respiratory_rate, oxygen_saturation,
        symptoms, diagnosis, treatment, appetite, food_intake, supplements,
        diet_plan, hemoglobin, blood_sugar, protein_level, notes,
        next_visit_date, follow_up_required
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recordData.id, recordData.patient_id, recordData.visit_date,
      recordData.visit_type, recordData.health_worker_id, recordData.weight, recordData.height,
      recordData.temperature, recordData.blood_pressure, recordData.pulse,
      recordData.respiratory_rate, recordData.oxygen_saturation, recordData.symptoms,
      recordData.diagnosis, recordData.treatment, recordData.appetite,
      recordData.food_intake, recordData.supplements, recordData.diet_plan,
      recordData.hemoglobin, recordData.blood_sugar, recordData.protein_level,
      recordData.notes, recordData.next_visit_date, recordData.follow_up_required
    ];

    console.log('💾 Executing database INSERT query...');
    await runQuery(query, values);

    // Update patient's last visit date
    const updatePatientQuery = `
      UPDATE patients 
      SET last_visit_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    console.log('💾 Updating patient last visit date...');
    await runQuery(updatePatientQuery, [recordData.visit_date, recordData.patient_id]);

    console.log('✅ Medical record successfully saved to database with ID:', recordData.id);
    res.status(201).json({ 
      message: 'Medical record created successfully', 
      id: recordData.id 
    });
  } catch (err) {
    console.error('❌ Error creating medical record:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;