const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// AI prediction routes would go here
// For now, returning empty array as AI predictions are handled in frontend context

router.get('/', (req, res) => {
  res.json([]);
});

module.exports = router;