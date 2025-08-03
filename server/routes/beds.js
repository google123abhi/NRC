const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get all beds
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all beds from database...');
    const query = `
      SELECT b.*, p.name as patient_name, p.type as patient_type, p.nutrition_status,
             h.name as hospital_name
      FROM beds b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN hospitals h ON b.hospital_id = h.id
      ORDER BY b.ward, b.number
    `;
    
    const rows = await getAllRows(query);
    
    // Transform to frontend format
    const beds = rows.map(row => ({
      id: row.id,
      hospitalId: row.hospital_id,
      number: row.number,
      ward: row.ward,
      status: row.status,
      patientId: row.patient_id,
      admissionDate: row.admission_date,
      patientName: row.patient_name,
      patientType: row.patient_type,
      nutritionStatus: row.nutrition_status,
      hospitalName: row.hospital_name
    }));
    
    console.log(`✅ Successfully retrieved ${beds.length} beds from database`);
    res.json(beds);
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
    
    // Begin transaction
    console.log('🔄 Starting database transaction...');
    await runQuery('BEGIN TRANSACTION');
    
    // Update bed
    const updateBedQuery = `
      UPDATE beds 
      SET status = ?, patient_id = ?, admission_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    console.log('💾 Updating bed in database...');
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
      
      console.log('💾 Updating patient bed assignment...');
      await runQuery(updatePatientQuery, [req.params.id, patientId]);
    } else if (status === 'available') {
      // Clear patient's bed assignment if freeing bed
      const clearPatientBedQuery = `
        UPDATE patients 
        SET bed_id = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE bed_id = ?
      `;
      
      console.log('💾 Clearing patient bed assignment...');
      await runQuery(clearPatientBedQuery, [req.params.id]);
    }
    
    await runQuery('COMMIT');
    console.log('✅ Bed successfully updated in database');
    res.json({ message: 'Bed updated successfully' });
  } catch (err) {
    await runQuery('ROLLBACK');
    console.error('❌ Error updating bed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;