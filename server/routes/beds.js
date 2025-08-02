const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get all beds
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT b.*, p.name as patient_name, p.type as patient_type, p.nutrition_status
      FROM beds b
      LEFT JOIN patients p ON b.patient_id = p.id
      ORDER BY b.ward, b.number
    `;
    
    const rows = await getAllRows(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching beds:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update bed status
router.put('/:id', async (req, res) => {
  console.log('Received bed update data on server:', req.body);
  
  const { status, patientId, admissionDate } = req.body;
  
  try {
    // Begin transaction
    await runQuery('BEGIN TRANSACTION');
    
    // Update bed
    const updateBedQuery = `
      UPDATE beds 
      SET status = ?, patient_id = ?, admission_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    console.log('Updating bed with values:', [status, patientId, admissionDate, req.params.id]);
    const result = await runQuery(updateBedQuery, [status, patientId, admissionDate, req.params.id]);
    
    if (result.changes === 0) {
      await runQuery('ROLLBACK');
      return res.status(404).json({ error: 'Bed not found' });
    }
    
    // Update patient's bed assignment if assigning
    if (patientId) {
      const updatePatientQuery = `
        UPDATE patients 
        SET bed_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      console.log('Updating patient bed assignment:', [req.params.id, patientId]);
      await runQuery(updatePatientQuery, [req.params.id, patientId]);
    } else if (status === 'available') {
      // Clear patient's bed assignment if freeing bed
      const clearPatientBedQuery = `
        UPDATE patients 
        SET bed_id = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE bed_id = ?
      `;
      
      console.log('Clearing patient bed assignment for bed:', req.params.id);
      await runQuery(clearPatientBedQuery, [req.params.id]);
    }
    
    await runQuery('COMMIT');
    console.log('Bed updated successfully in database');
    res.json({ message: 'Bed updated successfully' });
  } catch (err) {
    await runQuery('ROLLBACK');
    console.error('Error updating bed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;