const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get all anganwadi centers
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM anganwadi_centers 
      WHERE is_active = 1
      ORDER BY name
    `;
    
    const rows = await getAllRows(query);
    
    // Parse JSON fields
    const anganwadis = rows.map(row => ({
      ...row,
      facilities: row.facilities ? JSON.parse(row.facilities) : [],
      coverage_areas: row.coverage_areas ? JSON.parse(row.coverage_areas) : []
    }));
    
    res.json(anganwadis);
  } catch (err) {
    console.error('Error fetching anganwadis:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new anganwadi center
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('code').notEmpty().withMessage('Code is required'),
  body('location_area').notEmpty().withMessage('Location area is required'),
  body('location_district').notEmpty().withMessage('Location district is required'),
  body('location_state').notEmpty().withMessage('Location state is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const anganwadiData = {
      id: uuidv4(),
      ...req.body,
      facilities: JSON.stringify(req.body.facilities || []),
      coverage_areas: JSON.stringify(req.body.coverage_areas || [])
    };

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

    await runQuery(query, values);
    
    res.status(201).json({ 
      message: 'Anganwadi center created successfully', 
      id: anganwadiData.id 
    });
  } catch (err) {
    console.error('Error creating anganwadi:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update anganwadi center
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Convert arrays to JSON strings
    if (updates.facilities) updates.facilities = JSON.stringify(updates.facilities);
    if (updates.coverage_areas) updates.coverage_areas = JSON.stringify(updates.coverage_areas);

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    const query = `UPDATE anganwadi_centers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const result = await runQuery(query, values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Anganwadi center not found' });
    }
    
    res.json({ message: 'Anganwadi center updated successfully' });
  } catch (err) {
    console.error('Error updating anganwadi:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;