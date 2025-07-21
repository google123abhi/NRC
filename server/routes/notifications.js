const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get notifications by role
router.get('/role/:role', (req, res) => {
  const query = `
    SELECT * FROM notifications 
    WHERE user_role = ? 
    ORDER BY created_at DESC
  `;
  
  db.all(query, [req.params.role], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create notification
router.post('/', (req, res) => {
  const notificationData = {
    id: uuidv4(),
    ...req.body
  };

  const query = `
    INSERT INTO notifications (id, user_role, type, title, message, priority, action_required, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    notificationData.id, notificationData.user_role, notificationData.type,
    notificationData.title, notificationData.message, notificationData.priority || 'medium',
    notificationData.action_required || 0, notificationData.date || new Date().toISOString().split('T')[0]
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Notification created successfully', 
      id: notificationData.id 
    });
  });
});

// Mark notification as read
router.put('/:id/read', (req, res) => {
  const query = `UPDATE notifications SET read = 1 WHERE id = ?`;

  db.run(query, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read' });
  });
});

module.exports = router;