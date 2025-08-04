const express = require('express');
const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');

const router = express.Router();

// Get all beds
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all beds from MongoDB...');
    
    const beds = await Bed.find()
      .populate('patient_id', 'name type nutrition_status')
      .populate('hospital_id', 'name')
      .sort({ ward: 1, number: 1 });
    
    // Transform to frontend format
    const transformedBeds = beds.map(bed => ({
      id: bed._id,
      hospitalId: bed.hospital_id?._id,
      number: bed.number,
      ward: bed.ward,
      status: bed.status,
      patientId: bed.patient_id?._id,
      admissionDate: bed.admission_date,
      patientName: bed.patient_id?.name,
      patientType: bed.patient_id?.type,
      nutritionStatus: bed.patient_id?.nutrition_status,
      hospitalName: bed.hospital_id?.name
    }));
    
    console.log(`✅ Successfully retrieved ${transformedBeds.length} beds from MongoDB`);
    res.json(transformedBeds);
  } catch (err) {
    console.error('❌ Error fetching beds:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update bed status
router.put('/:id', async (req, res) => {
  try {
    console.log(`📝 Updating bed ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    const { status, patientId, admissionDate } = req.body;
    
    console.log('🔄 Starting MongoDB transaction...');
    
    // Update bed
    const updatedBed = await Bed.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          status, 
          patient_id: patientId || null, 
          admission_date: admissionDate || null 
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedBed) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    
    // Update patient's bed assignment if assigning
    if (patientId) {
      console.log('💾 Updating patient bed assignment...');
      await Patient.findByIdAndUpdate(
        patientId,
        { $set: { bed_id: req.params.id } }
      );
    } else if (status === 'available') {
      // Clear patient's bed assignment if freeing bed
      console.log('💾 Clearing patient bed assignment...');
      await Patient.updateMany(
        { bed_id: req.params.id },
        { $unset: { bed_id: 1 } }
      );
    }
    
    console.log('✅ Bed successfully updated in MongoDB');
    res.json({ message: 'Bed updated successfully', bed: updatedBed });
  } catch (err) {
    console.error('❌ Error updating bed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;