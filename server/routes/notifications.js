const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get notifications by role
router.get('/role/:role', async (req, res) => {
  try {
    const query = `
      SELECT * FROM notifications 
      WHERE user_role = ? 
      ORDER BY created_at DESC
    `;
    
    const rows = await getAllRows(query, [req.params.role]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    console.log('Received notification data on server:', req.body);
    
    const notificationData = {
      id: uuidv4(),
      user_role: req.body.userRole,
      type: req.body.type,
      title: req.body.title,
      message: req.body.message,
      priority: req.body.priority || 'medium',
      action_required: req.body.actionRequired || 0,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };

    console.log('Processed notification data for database:', notificationData);

    const query = `
      INSERT INTO notifications (id, user_role, type, title, message, priority, action_required, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      notificationData.id, notificationData.user_role, notificationData.type,
      notificationData.title, notificationData.message, notificationData.priority,
      notificationData.action_required, notificationData.date
    ];

    console.log('Executing database query with values:', values);
    await runQuery(query, values);
    console.log('Notification saved to database successfully');
    
    res.status(201).json({ 
      message: 'Notification created successfully', 
      id: notificationData.id,
      notification: notificationData
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const query = `UPDATE notifications SET read = 1 WHERE id = ?`;

    const result = await runQuery(query, [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;