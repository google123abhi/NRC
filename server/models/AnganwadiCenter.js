const mongoose = require('mongoose');

const anganwadiCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    area: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  supervisor: {
    name: String,
    contact_number: String,
    employee_id: String
  },
  capacity: {
    pregnant_women: {
      type: Number,
      default: 0
    },
    children: {
      type: Number,
      default: 0
    }
  },
  facilities: [String],
  coverage_areas: [String],
  established_date: Date,
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('AnganwadiCenter', anganwadiCenterSchema);