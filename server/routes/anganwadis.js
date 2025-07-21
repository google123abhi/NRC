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

module.exports = router;