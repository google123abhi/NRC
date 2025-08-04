const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  registration_number: {
    type: String,
    required: true,
    unique: true
  },
  aadhaar_number: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['child', 'pregnant']
  },
  pregnancy_week: Number,
  contact_number: {
    type: String,
    required: true
  },
  emergency_contact: String,
  address: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  blood_pressure: String,
  temperature: Number,
  hemoglobin: Number,
  nutrition_status: {
    type: String,
    required: true,
    enum: ['normal', 'malnourished', 'severely_malnourished']
  },
  medical_history: [String],
  symptoms: [String],
  documents: [String],
  photos: [String],
  remarks: String,
  risk_score: {
    type: Number,
    default: 0
  },
  nutritional_deficiency: [String],
  bed_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed'
  },
  last_visit_date: Date,
  next_visit_date: Date,
  registered_by: String,
  registration_date: {
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

module.exports = mongoose.model('Patient', patientSchema);