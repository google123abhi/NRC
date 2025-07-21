const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get all anganwadi centers
router.get('/', (req, res) => {
  const query = `
    SELECT * FROM anganwadi_centers 
    WHERE is_active = 1
    ORDER BY name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Parse JSON fields
    const anganwadis = rows.map(row => ({
      ...row,
      facilities: row.facilities ? JSON.parse(row.facilities) : [],
      coverage_areas: row.coverage_areas ? JSON.parse(row.coverage_areas) : []
    }));
    
    res.json(anganwadis);
  });
});

// Create new anganwadi center
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('code').notEmpty().withMessage('Code is required'),
  body('location_area').notEmpty().withMessage('Location area is required'),
  body('location_district').notEmpty().withMessage('Location district is required'),
  body('location_state').notEmpty().withMessage('Location state is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Anganwadi center created successfully', 
      id: anganwadiData.id 
    });
  });
});

// Update anganwadi center
router.put('/:id', (req, res) => {
  const updates = { ...req.body };
  
  // Convert arrays to JSON strings
  if (updates.facilities) updates.facilities = JSON.stringify(updates.facilities);
  if (updates.coverage_areas) updates.coverage_areas = JSON.stringify(updates.coverage_areas);

  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  const query = `UPDATE anganwadi_centers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Anganwadi center not found' });
    }
    res.json({ message: 'Anganwadi center updated successfully' });
  });
});

module.exports = router;