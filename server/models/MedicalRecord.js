const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  visit_date: {
    type: Date,
    default: Date.now
  },
  visit_type: {
    type: String,
    required: true,
    enum: ['routine', 'emergency', 'follow_up', 'admission', 'discharge']
  },
  health_worker_id: String,
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  temperature: Number,
  blood_pressure: String,
  pulse: Number,
  respiratory_rate: Number,
  oxygen_saturation: Number,
  symptoms: [String],
  diagnosis: [String],
  treatment: [String],
  appetite: {
    type: String,
    enum: ['poor', 'moderate', 'good']
  },
  food_intake: {
    type: String,
    enum: ['inadequate', 'adequate', 'excessive']
  },
  supplements: [String],
  diet_plan: String,
  hemoglobin: Number,
  blood_sugar: Number,
  protein_level: Number,
  notes: String,
  next_visit_date: Date,
  follow_up_required: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);