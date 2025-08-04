const mongoose = require('mongoose');

const bedRequestSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  requested_by: String,
  request_date: {
    type: Date,
    default: Date.now
  },
  urgency_level: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  medical_justification: {
    type: String,
    required: true
  },
  current_condition: {
    type: String,
    required: true
  },
  estimated_stay_duration: {
    type: Number,
    required: true
  },
  special_requirements: String,
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'declined', 'cancelled']
  },
  reviewed_by: String,
  review_date: Date,
  review_comments: String,
  hospital_referral: {
    hospital_name: String,
    contact_number: String,
    referral_reason: String,
    referral_date: Date,
    urgency_level: {
      type: String,
      enum: ['routine', 'urgent', 'emergency']
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('BedRequest', bedRequestSchema);