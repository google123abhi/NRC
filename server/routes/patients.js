const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all patients from MongoDB...');
    
    const patients = await Patient.find({ is_active: true })
      .populate('bed_id')
      .sort({ created_at: -1 });
    
    console.log(`✅ Successfully retrieved ${patients.length} patients from MongoDB`);
    res.json(patients);
  } catch (err) {
    console.error('❌ Error fetching patients:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`📊 Fetching patient ${req.params.id} from MongoDB...`);
    
    const patient = await Patient.findById(req.params.id)
      .populate('bed_id');
    
    if (!patient || !patient.is_active) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    console.log(`✅ Successfully retrieved patient ${req.params.id} from MongoDB`);
    res.json(patient);
  } catch (err) {
    console.error('❌ Error fetching patient:', err);
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
    
    const patientData = {
      registration_number: `NRC${Date.now()}`,
      aadhaar_number: req.body.aadhaarNumber,
      name: req.body.name,
      age: req.body.age,
      type: req.body.type,
      pregnancy_week: req.body.pregnancyWeek,
      contact_number: req.body.contactNumber,
      emergency_contact: req.body.emergencyContact || req.body.contactNumber,
      address: req.body.address,
      weight: req.body.weight,
      height: req.body.height,
      blood_pressure: req.body.bloodPressure,
      temperature: req.body.temperature,
      hemoglobin: req.body.hemoglobin,
      nutrition_status: req.body.nutritionStatus,
      medical_history: req.body.medicalHistory || [],
      symptoms: req.body.symptoms || [],
      documents: req.body.documents || [],
      photos: req.body.photos || [],
      remarks: req.body.remarks,
      risk_score: req.body.riskScore || 0,
      nutritional_deficiency: req.body.nutritionalDeficiency || [],
      registered_by: req.body.registeredBy
    };

    console.log('🔄 Processing patient data for MongoDB storage:', JSON.stringify(patientData, null, 2));

    const newPatient = new Patient(patientData);
    const savedPatient = await newPatient.save();
    
    console.log('✅ Patient successfully saved to MongoDB with ID:', savedPatient._id);

    // Create notification for high-risk patients
    if ((patientData.risk_score && patientData.risk_score > 80) || patientData.nutrition_status === 'severely_malnourished') {
      console.log('🚨 Creating high-risk patient notification...');
      
      const notification = new Notification({
        user_role: 'supervisor',
        type: 'high_risk_alert',
        title: 'High Risk Patient Registered',
        message: `New high-risk patient ${patientData.name} has been registered with ${patientData.nutrition_status} status.`,
        priority: 'high',
        action_required: true
      });
      
      await notification.save();
      console.log('✅ High-risk notification created');
    }

    res.status(201).json({ 
      message: 'Patient created successfully', 
      id: savedPatient._id,
      patient: savedPatient
    });
  } catch (err) {
    console.error('❌ Error creating patient:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    console.log(`📝 Updating patient ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    const updates = { ...req.body };
    
    // Convert frontend field names to database field names
    if (updates.medicalHistory) {
      updates.medical_history = updates.medicalHistory;
      delete updates.medicalHistory;
    }
    if (updates.nutritionalDeficiency) {
      updates.nutritional_deficiency = updates.nutritionalDeficiency;
      delete updates.nutritionalDeficiency;
    }
    if (updates.contactNumber) {
      updates.contact_number = updates.contactNumber;
      delete updates.contactNumber;
    }
    if (updates.nutritionStatus) {
      updates.nutrition_status = updates.nutritionStatus;
      delete updates.nutritionStatus;
    }

    console.log('💾 Executing MongoDB update...');
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!updatedPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    console.log('✅ Patient successfully updated in MongoDB');
    res.json({ message: 'Patient updated successfully', patient: updatedPatient });
  } catch (err) {
    console.error('❌ Error updating patient:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete patient (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    console.log(`🗑️ Soft deleting patient ${req.params.id}...`);
    
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: { is_active: false } },
      { new: true }
    );
    
    if (!updatedPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    console.log('✅ Patient successfully deleted from MongoDB');
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting patient:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;