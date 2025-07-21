const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Survey routes would go here
// For now, returning empty array as surveys are handled in frontend context

router.get('/', (req, res) => {
  res.json([]);
});

module.exports = router;