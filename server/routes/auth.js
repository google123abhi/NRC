const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('employee_id').notEmpty().withMessage('Employee ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password, employee_id } = req.body;
    console.log('🔐 Login attempt for:', { username, employee_id });

    // Query user from MySQL database
    const [rows] = await pool.execute(`
      SELECT * FROM users 
      WHERE username = ? AND employee_id = ? AND is_active = TRUE
    `, [username, employee_id]);

    if (rows.length === 0) {
      console.log('❌ User not found in MySQL database');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    console.log('✅ User found in MySQL database:', user.name);

    // For demo purposes, accept simple passwords
    // In production, use: const validPassword = await bcrypt.compare(password, user.password_hash);
    const validPassword = password === 'worker123' || password === 'super123' || password === 'hosp123' || password === 'admin123';
    
    if (!validPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        employeeId: user.employee_id, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('✅ Login successful for:', user.name);

    res.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
        contact_number: user.contact_number,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin routes for user management
router.get('/users', async (req, res) => {
  try {
    console.log('📊 Fetching all users from MySQL database...');
    
    const [rows] = await pool.execute(`
      SELECT id, employee_id, username, name, role, contact_number, email, is_active, created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log(`✅ Successfully retrieved ${rows.length} users from MySQL`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching users from MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new user (Admin only)
router.post('/users', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['anganwadi_worker', 'supervisor', 'hospital', 'admin']).withMessage('Valid role is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('📝 Creating new user in MySQL:', JSON.stringify(req.body, null, 2));
    
    const userId = `USER-${Date.now()}`;
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    
    await pool.execute(`
      INSERT INTO users (
        id, employee_id, username, password_hash, name, role, 
        contact_number, email, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      req.body.employeeId,
      req.body.username,
      hashedPassword,
      req.body.name,
      req.body.role,
      req.body.contactNumber || null,
      req.body.email || null,
      req.body.createdBy || 'ADMIN'
    ]);
    
    console.log('✅ User successfully created in MySQL database with ID:', userId);
    res.status(201).json({ message: 'User created successfully', id: userId });
  } catch (err) {
    console.error('❌ Error creating user in MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    console.log(`📝 Updating user ${req.params.id} in MySQL:`, JSON.stringify(req.body, null, 2));
    
    const updates = req.body;
    const updateFields = [];
    const updateValues = [];
    
    if (updates.name) { updateFields.push('name = ?'); updateValues.push(updates.name); }
    if (updates.contactNumber) { updateFields.push('contact_number = ?'); updateValues.push(updates.contactNumber); }
    if (updates.email) { updateFields.push('email = ?'); updateValues.push(updates.email); }
    if (updates.isActive !== undefined) { updateFields.push('is_active = ?'); updateValues.push(updates.isActive); }
    if (updates.password) {
      const hashedPassword = await bcrypt.hash(updates.password, 12);
      updateFields.push('password_hash = ?');
      updateValues.push(hashedPassword);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(req.params.id);

    const [result] = await pool.execute(`
      UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
    `, updateValues);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User successfully updated in MySQL database');
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('❌ Error updating user in MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user (soft delete)
router.delete('/users/:id', async (req, res) => {
  try {
    console.log(`🗑️ Soft deleting user ${req.params.id} in MySQL...`);
    
    const [result] = await pool.execute(`
      UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User successfully deactivated in MySQL database');
    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error('❌ Error deactivating user in MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;