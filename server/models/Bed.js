const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  hospital_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  number: {
    type: String,
    required: true
  },
  ward: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  admission_date: Date
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Bed', bedSchema);