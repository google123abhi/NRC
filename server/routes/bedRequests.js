const express = require('express');
const { body, validationResult } = require('express-validator');
const BedRequest = require('../models/BedRequest');
const Patient = require('../models/Patient');
const User = require('../models/User');

const router = express.Router();

// Get all bed requests
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all bed requests from MongoDB...');
    
    const bedRequests = await BedRequest.find()
      .populate('patient_id', 'name type nutrition_status')
      .sort({ created_at: -1 });
    
    // Transform to frontend format
    const transformedRequests = bedRequests.map(request => ({
      id: request._id,
      patientId: request.patient_id._id,
      requestedBy: request.requested_by,
      requestDate: request.request_date,
      urgencyLevel: request.urgency_level,
      medicalJustification: request.medical_justification,
      currentCondition: request.current_condition,
      estimatedStayDuration: request.estimated_stay_duration,
      specialRequirements: request.special_requirements,
      status: request.status,
      reviewedBy: request.reviewed_by,
      reviewDate: request.review_date,
      reviewComments: request.review_comments,
      hospitalReferral: request.hospital_referral,
      patientName: request.patient_id.name,
      patientType: request.patient_id.type,
      nutritionStatus: request.patient_id.nutrition_status
    }));
    
    console.log(`✅ Successfully retrieved ${transformedRequests.length} bed requests from MongoDB`);
    res.json(transformedRequests);
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
      patient_id: req.body.patientId,
      requested_by: req.body.requestedBy,
      request_date: req.body.requestDate || new Date(),
      urgency_level: req.body.urgencyLevel,
      medical_justification: req.body.medicalJustification,
      current_condition: req.body.currentCondition,
      estimated_stay_duration: req.body.estimatedStayDuration,
      special_requirements: req.body.specialRequirements,
      status: req.body.status || 'pending'
    };

    console.log('🔄 Processing bed request data for MongoDB storage:', JSON.stringify(requestData, null, 2));

    const newBedRequest = new BedRequest(requestData);
    const savedBedRequest = await newBedRequest.save();
    
    console.log('✅ Bed request successfully saved to MongoDB with ID:', savedBedRequest._id);
    
    res.status(201).json({ 
      message: 'Bed request created successfully', 
      id: savedBedRequest._id,
      bedRequest: savedBedRequest
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
    
    const updates = { ...req.body };
    
    console.log('💾 Executing MongoDB update...');
    const updatedBedRequest = await BedRequest.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!updatedBedRequest) {
      return res.status(404).json({ error: 'Bed request not found' });
    }
    
    console.log('✅ Bed request successfully updated in MongoDB');
    res.json({ message: 'Bed request updated successfully', bedRequest: updatedBedRequest });
  } catch (err) {
    console.error('❌ Error updating bed request:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;