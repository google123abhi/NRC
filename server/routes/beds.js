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
  const { status, patient_id, admission_date } = req.body;
  
  try {
    // Begin transaction
    await runQuery('BEGIN TRANSACTION');
    
    // Update bed
    const updateBedQuery = `
      UPDATE beds 
      SET status = ?, patient_id = ?, admission_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const result = await runQuery(updateBedQuery, [status, patient_id, admission_date, req.params.id]);
    
    if (result.changes === 0) {
      await runQuery('ROLLBACK');
      return res.status(404).json({ error: 'Bed not found' });
    }
    
    // Update patient's bed assignment if assigning
    if (patient_id) {
      const updatePatientQuery = `
        UPDATE patients 
        SET bed_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await runQuery(updatePatientQuery, [req.params.id, patient_id]);
    } else if (status === 'available') {
      // Clear patient's bed assignment if freeing bed
      const clearPatientBedQuery = `
        UPDATE patients 
        SET bed_id = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE bed_id = ?
      `;
      
      await runQuery(clearPatientBedQuery, [req.params.id]);
    }
    
    await runQuery('COMMIT');
    res.json({ message: 'Bed updated successfully' });
  } catch (err) {
    await runQuery('ROLLBACK');
    console.error('Error updating bed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;