const express = require('express');
const { body, validationResult } = require('express-validator');
const AnganwadiCenter = require('../models/AnganwadiCenter');

const router = express.Router();

// Get all anganwadi centers
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all anganwadi centers from MongoDB...');
    
    const anganwadis = await AnganwadiCenter.find({ is_active: true })
      .sort({ name: 1 });
    
    // Transform to frontend format
    const transformedAnganwadis = anganwadis.map(anganwadi => ({
      id: anganwadi._id,
      name: anganwadi.name,
      code: anganwadi.code,
      location: anganwadi.location,
      supervisor: anganwadi.supervisor,
      capacity: {
        pregnantWomen: anganwadi.capacity.pregnant_women,
        children: anganwadi.capacity.children
      },
      facilities: anganwadi.facilities,
      coverageAreas: anganwadi.coverage_areas,
      establishedDate: anganwadi.established_date,
      isActive: anganwadi.is_active
    }));
    
    console.log(`✅ Successfully retrieved ${transformedAnganwadis.length} anganwadi centers from MongoDB`);
    res.json(transformedAnganwadis);
  } catch (err) {
    console.error('❌ Error fetching anganwadis:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new anganwadi center
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('code').notEmpty().withMessage('Code is required'),
  body('location.area').notEmpty().withMessage('Location area is required'),
  body('location.district').notEmpty().withMessage('Location district is required'),
  body('location.state').notEmpty().withMessage('Location state is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('📝 Received anganwadi data from frontend:', JSON.stringify(req.body, null, 2));
    
    const anganwadiData = {
      name: req.body.name,
      code: req.body.code,
      location: {
        area: req.body.location.area,
        district: req.body.location.district,
        state: req.body.location.state,
        pincode: req.body.location.pincode,
        coordinates: {
          latitude: req.body.location.coordinates?.latitude,
          longitude: req.body.location.coordinates?.longitude
        }
      },
      supervisor: {
        name: req.body.supervisor.name,
        contact_number: req.body.supervisor.contactNumber,
        employee_id: req.body.supervisor.employeeId
      },
      capacity: {
        pregnant_women: req.body.capacity.pregnantWomen,
        children: req.body.capacity.children
      },
      facilities: req.body.facilities || [],
      coverage_areas: req.body.coverageAreas || [],
      established_date: req.body.establishedDate
    };

    console.log('🔄 Processing anganwadi data for MongoDB storage:', JSON.stringify(anganwadiData, null, 2));

    const newAnganwadi = new AnganwadiCenter(anganwadiData);
    const savedAnganwadi = await newAnganwadi.save();
    
    console.log('✅ Anganwadi center successfully saved to MongoDB with ID:', savedAnganwadi._id);
    
    res.status(201).json({ 
      message: 'Anganwadi center created successfully', 
      id: savedAnganwadi._id,
      anganwadi: savedAnganwadi
    });
  } catch (err) {
    console.error('❌ Error creating anganwadi:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update anganwadi center
router.put('/:id', async (req, res) => {
  try {
    console.log(`📝 Updating anganwadi ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    const updates = { ...req.body };
    
    console.log('💾 Executing MongoDB update...');
    const updatedAnganwadi = await AnganwadiCenter.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!updatedAnganwadi) {
      return res.status(404).json({ error: 'Anganwadi center not found' });
    }
    
    console.log('✅ Anganwadi center successfully updated in MongoDB');
    res.json({ message: 'Anganwadi center updated successfully', anganwadi: updatedAnganwadi });
  } catch (err) {
    console.error('❌ Error updating anganwadi:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;