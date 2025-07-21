const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get all beds
router.get('/', (req, res) => {
  const query = `
    SELECT b.*, p.name as patient_name, p.type as patient_type, p.nutrition_status
    FROM beds b
    LEFT JOIN patients p ON b.patient_id = p.id
    ORDER BY b.ward, b.number
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Update bed status
router.put('/:id', (req, res) => {
  const { status, patient_id, admission_date } = req.body;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Update bed
    const updateBedQuery = `
      UPDATE beds 
      SET status = ?, patient_id = ?, admission_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.run(updateBedQuery, [status, patient_id, admission_date, req.params.id], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Bed not found' });
      }
      
      // Update patient's bed assignment if assigning
      if (patient_id) {
        const updatePatientQuery = `
          UPDATE patients 
          SET bed_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        db.run(updatePatientQuery, [req.params.id, patient_id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          
          db.run('COMMIT');
          res.json({ message: 'Bed updated successfully' });
        });
      } else if (status === 'available') {
        // Clear patient's bed assignment if freeing bed
        const clearPatientBedQuery = `
          UPDATE patients 
          SET bed_id = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE bed_id = ?
        `;
        
        db.run(clearPatientBedQuery, [req.params.id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          
          db.run('COMMIT');
          res.json({ message: 'Bed updated successfully' });
        });
      } else {
        db.run('COMMIT');
        res.json({ message: 'Bed updated successfully' });
      }
    });
  });
});

module.exports = router;