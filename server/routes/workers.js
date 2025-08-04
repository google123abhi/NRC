const express = require('express');
const { body, validationResult } = require('express-validator');
const Worker = require('../models/Worker');
const AnganwadiCenter = require('../models/AnganwadiCenter');

const router = express.Router();

// Get all workers
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all workers from MongoDB...');
    
    const workers = await Worker.find({ is_active: true })
      .populate('anganwadi_id', 'name location')
      .sort({ name: 1 });
    
    // Transform to frontend format
    const transformedWorkers = workers.map(worker => ({
      id: worker._id,
      employeeId: worker.employee_id,
      name: worker.name,
      role: worker.role,
      anganwadiId: worker.anganwadi_id?._id,
      contactNumber: worker.contact_number,
      address: worker.address,
      assignedAreas: worker.assigned_areas,
      qualifications: worker.qualifications,
      workingHours: worker.working_hours,
      emergencyContact: worker.emergency_contact,
      joinDate: worker.join_date,
      isActive: worker.is_active,
      anganwadiName: worker.anganwadi_id?.name,
      anganwadiArea: worker.anganwadi_id?.location?.area
    }));
    
    console.log(`✅ Successfully retrieved ${transformedWorkers.length} workers from MongoDB`);
    res.json(transformedWorkers);
  } catch (err) {
    console.error('❌ Error fetching workers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new worker
router.post('/', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['head', 'supervisor', 'helper', 'asha']).withMessage('Valid role is required'),
  body('contactNumber').notEmpty().withMessage('Contact number is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('📝 Received worker data from frontend:', JSON.stringify(req.body, null, 2));
    
    const workerData = {
      employee_id: req.body.employeeId,
      name: req.body.name,
      role: req.body.role,
      anganwadi_id: req.body.anganwadiId,
      contact_number: req.body.contactNumber,
      address: req.body.address,
      assigned_areas: req.body.assignedAreas || [],
      qualifications: req.body.qualifications || [],
      working_hours: req.body.workingHours,
      emergency_contact: req.body.emergencyContact,
      join_date: req.body.joinDate
    };

    console.log('🔄 Processing worker data for MongoDB storage:', JSON.stringify(workerData, null, 2));

    const newWorker = new Worker(workerData);
    const savedWorker = await newWorker.save();
    
    console.log('✅ Worker successfully saved to MongoDB with ID:', savedWorker._id);
    
    res.status(201).json({ 
      message: 'Worker created successfully', 
      id: savedWorker._id,
      worker: savedWorker
    });
  } catch (err) {
    console.error('❌ Error creating worker:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update worker
router.put('/:id', async (req, res) => {
  try {
    console.log(`📝 Updating worker ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    const updates = { ...req.body };
    
    // Convert frontend field names to database field names
    if (updates.employeeId) {
      updates.employee_id = updates.employeeId;
      delete updates.employeeId;
    }
    if (updates.contactNumber) {
      updates.contact_number = updates.contactNumber;
      delete updates.contactNumber;
    }
    if (updates.assignedAreas) {
      updates.assigned_areas = updates.assignedAreas;
      delete updates.assignedAreas;
    }
    if (updates.workingHours) {
      updates.working_hours = updates.workingHours;
      delete updates.workingHours;
    }
    if (updates.emergencyContact) {
      updates.emergency_contact = updates.emergencyContact;
      delete updates.emergencyContact;
    }
    if (updates.joinDate) {
      updates.join_date = updates.joinDate;
      delete updates.joinDate;
    }
    if (updates.isActive !== undefined) {
      updates.is_active = updates.isActive;
      delete updates.isActive;
    }

    console.log('💾 Executing MongoDB update...');
    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!updatedWorker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    console.log('✅ Worker successfully updated in MongoDB');
    res.json({ message: 'Worker updated successfully', worker: updatedWorker });
  } catch (err) {
    console.error('❌ Error updating worker:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;