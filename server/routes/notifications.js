const express = require('express');
const Notification = require('../models/Notification');

const router = express.Router();

// Get notifications by role
router.get('/role/:role', async (req, res) => {
  try {
    console.log(`📊 Fetching notifications for role ${req.params.role} from MongoDB...`);
    
    const notifications = await Notification.find({ user_role: req.params.role })
      .sort({ created_at: -1 });
    
    // Transform to frontend format
    const transformedNotifications = notifications.map(notification => ({
      id: notification._id,
      userRole: notification.user_role,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      actionRequired: notification.action_required,
      read: notification.read,
      date: notification.date
    }));
    
    console.log(`✅ Successfully retrieved ${transformedNotifications.length} notifications from MongoDB`);
    res.json(transformedNotifications);
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
      user_role: req.body.userRole,
      type: req.body.type,
      title: req.body.title,
      message: req.body.message,
      priority: req.body.priority || 'medium',
      action_required: req.body.actionRequired || false,
      date: req.body.date || new Date()
    };

    console.log('🔄 Processing notification data for MongoDB storage:', JSON.stringify(notificationData, null, 2));

    const newNotification = new Notification(notificationData);
    const savedNotification = await newNotification.save();
    
    console.log('✅ Notification successfully saved to MongoDB with ID:', savedNotification._id);
    
    res.status(201).json({ 
      message: 'Notification created successfully', 
      id: savedNotification._id,
      notification: savedNotification
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
    
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true }
    );
    
    if (!updatedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    console.log('✅ Notification successfully marked as read in MongoDB');
    res.json({ message: 'Notification marked as read', notification: updatedNotification });
  } catch (err) {
    console.error('❌ Error updating notification:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;