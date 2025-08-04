const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['head', 'supervisor', 'helper', 'asha']
  },
  anganwadi_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnganwadiCenter'
  },
  contact_number: {
    type: String,
    required: true
  },
  address: String,
  assigned_areas: [String],
  qualifications: [String],
  working_hours: {
    start: String,
    end: String
  },
  emergency_contact: {
    name: String,
    relation: String,
    contact_number: String
  },
  join_date: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Worker', workerSchema);