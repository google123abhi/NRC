const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get all anganwadi centers
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all anganwadi centers from database...');
    const query = `
      SELECT * FROM anganwadi_centers 
      WHERE is_active = 1
      ORDER BY name
    `;
    
    const rows = await getAllRows(query);
    
    // Parse JSON fields and transform to frontend format
    const anganwadis = rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      location: {
        area: row.location_area,
        district: row.location_district,
        state: row.location_state,
        pincode: row.location_pincode,
        coordinates: {
          latitude: row.latitude || 0,
          longitude: row.longitude || 0
        }
      },
      supervisor: {
        name: row.supervisor_name,
        contactNumber: row.supervisor_contact,
        employeeId: row.supervisor_employee_id
      },
      capacity: {
        pregnantWomen: row.capacity_pregnant_women,
        children: row.capacity_children
      },
      facilities: row.facilities ? JSON.parse(row.facilities) : [],
      coverageAreas: row.coverage_areas ? JSON.parse(row.coverage_areas) : [],
      establishedDate: row.established_date,
      isActive: row.is_active === 1
    }));
    
    console.log(`✅ Successfully retrieved ${anganwadis.length} anganwadi centers from database`);
    res.json(anganwadis);
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
      id: uuidv4(),
      name: req.body.name,
      code: req.body.code,
      location_area: req.body.location.area,
      location_district: req.body.location.district,
      location_state: req.body.location.state,
      location_pincode: req.body.location.pincode,
      latitude: req.body.location.coordinates?.latitude,
      longitude: req.body.location.coordinates?.longitude,
      supervisor_name: req.body.supervisor.name,
      supervisor_contact: req.body.supervisor.contactNumber,
      supervisor_employee_id: req.body.supervisor.employeeId,
      capacity_pregnant_women: req.body.capacity.pregnantWomen,
      capacity_children: req.body.capacity.children,
      facilities: JSON.stringify(req.body.facilities || []),
      coverage_areas: JSON.stringify(req.body.coverageAreas || []),
      established_date: req.body.establishedDate
    };

    console.log('🔄 Processing anganwadi data for database storage:', JSON.stringify(anganwadiData, null, 2));

    const query = `
      INSERT INTO anganwadi_centers (
        id, name, code, location_area, location_district, location_state, 
        location_pincode, latitude, longitude, supervisor_name, supervisor_contact, 
        supervisor_employee_id, capacity_pregnant_women, capacity_children, 
        facilities, coverage_areas, established_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      anganwadiData.id, anganwadiData.name, anganwadiData.code,
      anganwadiData.location_area, anganwadiData.location_district, anganwadiData.location_state,
      anganwadiData.location_pincode, anganwadiData.latitude, anganwadiData.longitude,
      anganwadiData.supervisor_name, anganwadiData.supervisor_contact, anganwadiData.supervisor_employee_id,
      anganwadiData.capacity_pregnant_women, anganwadiData.capacity_children,
      anganwadiData.facilities, anganwadiData.coverage_areas, anganwadiData.established_date
    ];

    console.log('💾 Executing database INSERT query...');
    await runQuery(query, values);
    console.log('✅ Anganwadi center successfully saved to database with ID:', anganwadiData.id);
    
    res.status(201).json({ 
      message: 'Anganwadi center created successfully', 
      id: anganwadiData.id,
      anganwadi: anganwadiData
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
    
    // Convert arrays to JSON strings
    if (updates.facilities) updates.facilities = JSON.stringify(updates.facilities);
    if (updates.coverageAreas) updates.coverage_areas = JSON.stringify(updates.coverageAreas);

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    const query = `UPDATE anganwadi_centers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    console.log('💾 Executing database UPDATE query...');
    const result = await runQuery(query, values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Anganwadi center not found' });
    }
    
    console.log('✅ Anganwadi center successfully updated in database');
    res.json({ message: 'Anganwadi center updated successfully' });
  } catch (err) {
    console.error('❌ Error updating anganwadi:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;