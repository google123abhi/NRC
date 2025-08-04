const express = require('express');
const { body, validationResult } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');

const router = express.Router();

// Get medical records for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    console.log(`📊 Fetching medical records for patient ${req.params.patientId} from MongoDB...`);
    
    const records = await MedicalRecord.find({ patient_id: req.params.patientId })
      .sort({ visit_date: -1 });
    
    // Transform to frontend format
    const transformedRecords = records.map(record => ({
      id: record._id,
      patientId: record.patient_id,
      date: record.visit_date,
      visitType: record.visit_type,
      healthWorkerId: record.health_worker_id,
      vitals: {
        weight: record.weight,
        height: record.height,
        temperature: record.temperature,
        bloodPressure: record.blood_pressure,
        pulse: record.pulse,
        respiratoryRate: record.respiratory_rate,
        oxygenSaturation: record.oxygen_saturation
      },
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      nutritionAssessment: {
        appetite: record.appetite,
        foodIntake: record.food_intake,
        supplements: record.supplements,
        dietPlan: record.diet_plan
      },
      labResults: {
        hemoglobin: record.hemoglobin,
        bloodSugar: record.blood_sugar,
        proteinLevel: record.protein_level
      },
      notes: record.notes,
      nextVisitDate: record.next_visit_date,
      followUpRequired: record.follow_up_required
    }));
    
    console.log(`✅ Successfully retrieved ${transformedRecords.length} medical records from MongoDB`);
    res.json(transformedRecords);
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
      patient_id: req.body.patientId,
      visit_date: req.body.date || new Date(),
      visit_type: req.body.visitType,
      health_worker_id: req.body.healthWorkerId,
      weight: req.body.vitals.weight,
      height: req.body.vitals.height,
      temperature: req.body.vitals.temperature,
      blood_pressure: req.body.vitals.bloodPressure,
      pulse: req.body.vitals.pulse,
      respiratory_rate: req.body.vitals.respiratoryRate,
      oxygen_saturation: req.body.vitals.oxygenSaturation,
      symptoms: req.body.symptoms || [],
      diagnosis: req.body.diagnosis || [],
      treatment: req.body.treatment || [],
      appetite: req.body.nutritionAssessment?.appetite,
      food_intake: req.body.nutritionAssessment?.foodIntake,
      supplements: req.body.nutritionAssessment?.supplements || [],
      diet_plan: req.body.nutritionAssessment?.dietPlan,
      hemoglobin: req.body.labResults?.hemoglobin,
      blood_sugar: req.body.labResults?.bloodSugar,
      protein_level: req.body.labResults?.proteinLevel,
      notes: req.body.notes,
      next_visit_date: req.body.nextVisitDate,
      follow_up_required: req.body.followUpRequired || false
    };

    console.log('🔄 Processing medical record data for MongoDB storage:', JSON.stringify(recordData, null, 2));

    const newMedicalRecord = new MedicalRecord(recordData);
    const savedMedicalRecord = await newMedicalRecord.save();

    // Update patient's last visit date
    console.log('💾 Updating patient last visit date...');
    await Patient.findByIdAndUpdate(
      recordData.patient_id,
      { $set: { last_visit_date: recordData.visit_date } }
    );

    console.log('✅ Medical record successfully saved to MongoDB with ID:', savedMedicalRecord._id);
    res.status(201).json({ 
      message: 'Medical record created successfully', 
      id: savedMedicalRecord._id,
      medicalRecord: savedMedicalRecord
    });
  } catch (err) {
    console.error('❌ Error creating medical record:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;