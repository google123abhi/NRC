const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  health_worker_id: String,
  scheduled_date: {
    type: Date,
    required: true
  },
  actual_date: Date,
  status: {
    type: String,
    default: 'scheduled',
    enum: ['scheduled', 'completed', 'missed', 'rescheduled']
  },
  notes: String
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Visit', visitSchema);