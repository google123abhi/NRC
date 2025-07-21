const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get all workers
router.get('/', (req, res) => {
  const query = `
    SELECT w.*, a.name as anganwadi_name, a.location_area
    FROM workers w
    LEFT JOIN anganwadi_centers a ON w.anganwadi_id = a.id
    WHERE w.is_active = 1
    ORDER BY w.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Parse JSON fields
    const workers = rows.map(row => ({
      ...row,
      assigned_areas: row.assigned_areas ? JSON.parse(row.assigned_areas) : [],
      qualifications: row.qualifications ? JSON.parse(row.qualifications) : []
    }));
    
    res.json(workers);
  });
});

module.exports = router;