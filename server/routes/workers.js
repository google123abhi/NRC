const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get all workers
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT w.*, a.name as anganwadi_name, a.location_area
      FROM workers w
      LEFT JOIN anganwadi_centers a ON w.anganwadi_id = a.id
      WHERE w.is_active = 1
      ORDER BY w.name
    `;
    
    const rows = await getAllRows(query);
    
    // Parse JSON fields
    const workers = rows.map(row => ({
      ...row,
      assigned_areas: row.assigned_areas ? JSON.parse(row.assigned_areas) : [],
      qualifications: row.qualifications ? JSON.parse(row.qualifications) : []
    }));
    
    res.json(workers);
  } catch (err) {
    console.error('Error fetching workers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new worker
router.post('/', [
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['head', 'supervisor', 'helper', 'asha']).withMessage('Valid role is required'),
  body('contact_number').notEmpty().withMessage('Contact number is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const workerData = {
      id: uuidv4(),
      ...req.body,
      assigned_areas: JSON.stringify(req.body.assigned_areas || []),
      qualifications: JSON.stringify(req.body.qualifications || [])
    };

    const query = `
      INSERT INTO workers (
        id, employee_id, name, role, anganwadi_id, contact_number, address,
        assigned_areas, qualifications, working_hours_start, working_hours_end,
        emergency_contact_name, emergency_contact_relation, emergency_contact_number,
        join_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      workerData.id, workerData.employee_id, workerData.name, workerData.role,
      workerData.anganwadi_id, workerData.contact_number, workerData.address,
      workerData.assigned_areas, workerData.qualifications, workerData.working_hours_start,
      workerData.working_hours_end, workerData.emergency_contact_name, workerData.emergency_contact_relation,
      workerData.emergency_contact_number, workerData.join_date
    ];

    await runQuery(query, values);
    
    res.status(201).json({ 
      message: 'Worker created successfully', 
      id: workerData.id 
    });
  } catch (err) {
    console.error('Error creating worker:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update worker
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Convert arrays to JSON strings
    if (updates.assigned_areas) updates.assigned_areas = JSON.stringify(updates.assigned_areas);
    if (updates.qualifications) updates.qualifications = JSON.stringify(updates.qualifications);

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    const query = `UPDATE workers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const result = await runQuery(query, values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    res.json({ message: 'Worker updated successfully' });
  } catch (err) {
    console.error('Error updating worker:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;