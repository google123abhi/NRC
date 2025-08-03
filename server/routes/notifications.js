const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db, getAllRows, runQuery, getRow } = require('../database/init');

const router = express.Router();

// Get notifications by role
router.get('/role/:role', async (req, res) => {
  try {
    console.log(`📊 Fetching notifications for role ${req.params.role} from database...`);
    const query = `
      SELECT * FROM notifications 
      WHERE user_role = ? 
      ORDER BY created_at DESC
    `;
    
    const rows = await getAllRows(query, [req.params.role]);
    
    // Transform to frontend format
    const notifications = rows.map(row => ({
      id: row.id,
      userRole: row.user_role,
      type: row.type,
      title: row.title,
      message: row.message,
      priority: row.priority,
      actionRequired: row.action_required === 1,
      read: row.read === 1,
      date: row.date
    }));
    
    console.log(`✅ Successfully retrieved ${notifications.length} notifications from database`);
    res.json(notifications);
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received notification data from frontend:', JSON.stringify(req.body, null, 2));
    
    const notificationData = {
      id: uuidv4(),
      user_role: req.body.userRole,
      type: req.body.type,
      title: req.body.title,
      message: req.body.message,
      priority: req.body.priority || 'medium',
      action_required: req.body.actionRequired ? 1 : 0,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };

    console.log('🔄 Processing notification data for database storage:', JSON.stringify(notificationData, null, 2));

    const query = `
      INSERT INTO notifications (id, user_role, type, title, message, priority, action_required, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      notificationData.id, notificationData.user_role, notificationData.type,
      notificationData.title, notificationData.message, notificationData.priority,
      notificationData.action_required, notificationData.date
    ];

    console.log('💾 Executing database INSERT query...');
    await runQuery(query, values);
    console.log('✅ Notification successfully saved to database with ID:', notificationData.id);
    
    res.status(201).json({ 
      message: 'Notification created successfully', 
      id: notificationData.id,
      notification: notificationData
    });
  } catch (err) {
    console.error('❌ Error creating notification:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    console.log(`📝 Marking notification ${req.params.id} as read...`);
    const query = `UPDATE notifications SET read = 1 WHERE id = ?`;

    const result = await runQuery(query, [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    console.log('✅ Notification successfully marked as read in database');
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('❌ Error updating notification:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;