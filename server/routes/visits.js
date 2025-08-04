const express = require('express');
const { body, validationResult } = require('express-validator');
const Visit = require('../models/Visit');
const Patient = require('../models/Patient');
const User = require('../models/User');

const router = express.Router();

// Get all visits
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all visits from MongoDB...');
    
    const visits = await Visit.find()
      .populate('patient_id', 'name type')
      .sort({ scheduled_date: -1 });
    
    // Transform to frontend format
    const transformedVisits = visits.map(visit => ({
      id: visit._id,
      patientId: visit.patient_id._id,
      healthWorkerId: visit.health_worker_id,
      scheduledDate: visit.scheduled_date,
      actualDate: visit.actual_date,
      status: visit.status,
      notes: visit.notes,
      patientName: visit.patient_id.name,
      patientType: visit.patient_id.type
    }));
    
    console.log(`✅ Successfully retrieved ${transformedVisits.length} visits from MongoDB`);
    res.json(transformedVisits);
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
      patient_id: req.body.patientId,
      health_worker_id: req.body.healthWorkerId,
      scheduled_date: req.body.scheduledDate,
      actual_date: req.body.actualDate,
      status: req.body.status || 'scheduled',
      notes: req.body.notes
    };

    console.log('🔄 Processing visit data for MongoDB storage:', JSON.stringify(visitData, null, 2));

    const newVisit = new Visit(visitData);
    const savedVisit = await newVisit.save();
    
    console.log('✅ Visit successfully saved to MongoDB with ID:', savedVisit._id);
    
    res.status(201).json({ 
      message: 'Visit created successfully', 
      id: savedVisit._id,
      visit: savedVisit
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
    
    const updates = { ...req.body };
    
    console.log('💾 Executing MongoDB update...');
    const updatedVisit = await Visit.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!updatedVisit) {
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    console.log('✅ Visit successfully updated in MongoDB');
    res.json({ message: 'Visit updated successfully', visit: updatedVisit });
  } catch (err) {
    console.error('❌ Error updating visit:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;