const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get all workers
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all workers from database...');
    const query = `
      SELECT w.*, a.name as anganwadi_name, a.location_area
      FROM workers w
      LEFT JOIN anganwadi_centers a ON w.anganwadi_id = a.id
      WHERE w.is_active = 1
      ORDER BY w.name
    `;
    
    const rows = await getAllRows(query);
    
    // Parse JSON fields and transform to frontend format
    const workers = rows.map(row => ({
      id: row.id,
      employeeId: row.employee_id,
      name: row.name,
      role: row.role,
      anganwadiId: row.anganwadi_id,
      contactNumber: row.contact_number,
      address: row.address,
      assignedAreas: row.assigned_areas ? JSON.parse(row.assigned_areas) : [],
      qualifications: row.qualifications ? JSON.parse(row.qualifications) : [],
      workingHours: {
        start: row.working_hours_start,
        end: row.working_hours_end
      },
      emergencyContact: {
        name: row.emergency_contact_name,
        relation: row.emergency_contact_relation,
        contactNumber: row.emergency_contact_number
      },
      joinDate: row.join_date,
      isActive: row.is_active === 1,
      anganwadiName: row.anganwadi_name,
      anganwadiArea: row.location_area
    }));
    
    console.log(`✅ Successfully retrieved ${workers.length} workers from database`);
    res.json(workers);
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
      id: uuidv4(),
      employee_id: req.body.employeeId,
      name: req.body.name,
      role: req.body.role,
      anganwadi_id: req.body.anganwadiId,
      contact_number: req.body.contactNumber,
      address: req.body.address,
      assigned_areas: JSON.stringify(req.body.assignedAreas || []),
      qualifications: JSON.stringify(req.body.qualifications || []),
      working_hours_start: req.body.workingHours?.start,
      working_hours_end: req.body.workingHours?.end,
      emergency_contact_name: req.body.emergencyContact?.name,
      emergency_contact_relation: req.body.emergencyContact?.relation,
      emergency_contact_number: req.body.emergencyContact?.contactNumber,
      join_date: req.body.joinDate
    };

    console.log('🔄 Processing worker data for database storage:', JSON.stringify(workerData, null, 2));

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

    console.log('💾 Executing database INSERT query...');
    await runQuery(query, values);
    console.log('✅ Worker successfully saved to database with ID:', workerData.id);
    
    res.status(201).json({ 
      message: 'Worker created successfully', 
      id: workerData.id,
      worker: workerData
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
    
    // Convert arrays to JSON strings
    if (updates.assignedAreas) updates.assigned_areas = JSON.stringify(updates.assignedAreas);
    if (updates.qualifications) updates.qualifications = JSON.stringify(updates.qualifications);

    // Remove frontend field names that don't match database
    delete updates.assignedAreas;

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    const query = `UPDATE workers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    console.log('💾 Executing database UPDATE query...');
    const result = await runQuery(query, values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    console.log('✅ Worker successfully updated in database');
    res.json({ message: 'Worker updated successfully' });
  } catch (err) {
    console.error('❌ Error updating worker:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;