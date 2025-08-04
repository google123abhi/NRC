const mongoose = require('mongoose');

// Import all models
const User = require('../models/User');
const Patient = require('../models/Patient');
const AnganwadiCenter = require('../models/AnganwadiCenter');
const Worker = require('../models/Worker');
const Bed = require('../models/Bed');
const BedRequest = require('../models/BedRequest');
const Visit = require('../models/Visit');
const Notification = require('../models/Notification');
const MedicalRecord = require('../models/MedicalRecord');
const Hospital = require('../models/Hospital');

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nrc_management';
    
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Initialize sample data if database is empty
    await initializeSampleData();
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const initializeSampleData = async () => {
  try {
    console.log('🔄 Checking for existing data...');
    
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📊 Sample data already exists, skipping initialization');
      return;
    }
    
    console.log('📊 Initializing sample data...');
    
    // Create sample users
    const sampleUsers = [
      {
        employee_id: 'EMP001',
        username: 'priya.sharma',
        password_hash: 'worker123',
        name: 'Priya Sharma',
        role: 'anganwadi_worker',
        contact_number: '+91 9876543210',
        email: 'priya.sharma@gov.in'
      },
      {
        employee_id: 'SUP001',
        username: 'supervisor1',
        password_hash: 'super123',
        name: 'Dr. Sunita Devi',
        role: 'supervisor',
        contact_number: '+91 9876543211',
        email: 'sunita.devi@gov.in'
      },
      {
        employee_id: 'HOSP001',
        username: 'hospital1',
        password_hash: 'hosp123',
        name: 'Dr. Amit Sharma',
        role: 'hospital',
        contact_number: '+91 9876543212',
        email: 'amit.sharma@hospital.gov.in'
      }
    ];
    
    await User.insertMany(sampleUsers);
    console.log('✅ Sample users created');
    
    // Create sample hospital
    const sampleHospital = new Hospital({
      name: 'District Hospital Meerut',
      code: 'HOSP001',
      address: 'Medical College Road, Meerut, UP',
      contact_number: '+91 121-2234567',
      total_beds: 20,
      nrc_equipped: true
    });
    
    const hospital = await sampleHospital.save();
    console.log('✅ Sample hospital created');
    
    // Create sample anganwadi centers
    const sampleAnganwadi = new AnganwadiCenter({
      name: 'Anganwadi Center Sadar Bazaar',
      code: 'AWC001',
      location: {
        area: 'Sadar Bazaar',
        district: 'Meerut',
        state: 'Uttar Pradesh',
        pincode: '250001',
        coordinates: {
          latitude: 28.9845,
          longitude: 77.7064
        }
      },
      supervisor: {
        name: 'Mrs. Sunita Devi',
        contact_number: '+91 9876543213',
        employee_id: 'SUP001'
      },
      capacity: {
        pregnant_women: 50,
        children: 100
      },
      facilities: ['Kitchen', 'Playground', 'Medical Room', 'Toilet'],
      coverage_areas: ['Sadar Bazaar', 'Civil Lines', 'Shastri Nagar'],
      established_date: new Date('2020-01-15')
    });
    
    const anganwadi = await sampleAnganwadi.save();
    console.log('✅ Sample anganwadi created');
    
    // Create sample beds
    const sampleBeds = [
      {
        hospital_id: hospital._id,
        number: '101',
        ward: 'Pediatric',
        status: 'available'
      },
      {
        hospital_id: hospital._id,
        number: '102',
        ward: 'Pediatric',
        status: 'available'
      },
      {
        hospital_id: hospital._id,
        number: '201',
        ward: 'Maternity',
        status: 'available'
      },
      {
        hospital_id: hospital._id,
        number: '202',
        ward: 'Maternity',
        status: 'occupied'
      }
    ];
    
    await Bed.insertMany(sampleBeds);
    console.log('✅ Sample beds created');
    
    // Create sample patients
    const samplePatients = [
      {
        registration_number: 'NRC001',
        aadhaar_number: '1234-5678-9012',
        name: 'Aarav Kumar',
        age: 3,
        type: 'child',
        contact_number: '+91 9876543214',
        emergency_contact: '+91 9876543215',
        address: 'House No. 123, Sadar Bazaar, Meerut',
        weight: 8.5,
        height: 85,
        nutrition_status: 'severely_malnourished',
        medical_history: ['Anemia', 'Frequent infections'],
        symptoms: ['Weakness', 'Loss of appetite'],
        risk_score: 85,
        nutritional_deficiency: ['Protein', 'Iron', 'Vitamin D'],
        registered_by: 'EMP001'
      },
      {
        registration_number: 'NRC002',
        aadhaar_number: '2345-6789-0123',
        name: 'Priya Devi',
        age: 24,
        type: 'pregnant',
        pregnancy_week: 28,
        contact_number: '+91 9876543216',
        emergency_contact: '+91 9876543217',
        address: 'House No. 456, Civil Lines, Meerut',
        weight: 45,
        height: 155,
        nutrition_status: 'malnourished',
        medical_history: ['Anemia'],
        symptoms: ['Fatigue', 'Dizziness'],
        risk_score: 65,
        nutritional_deficiency: ['Iron', 'Folic Acid'],
        registered_by: 'EMP001'
      }
    ];
    
    await Patient.insertMany(samplePatients);
    console.log('✅ Sample patients created');
    
    // Create sample notifications
    const sampleNotifications = [
      {
        user_role: 'anganwadi_worker',
        type: 'high_risk_alert',
        title: 'High Risk Patient Alert',
        message: 'New SAM child Aarav Kumar registered with 85% risk score',
        priority: 'high',
        action_required: true
      },
      {
        user_role: 'supervisor',
        type: 'bed_request',
        title: 'Bed Request Pending',
        message: 'Bed request for Priya Devi awaiting approval',
        priority: 'medium',
        action_required: true
      }
    ];
    
    await Notification.insertMany(sampleNotifications);
    console.log('✅ Sample notifications created');
    
    console.log('🎉 Sample data initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
};

module.exports = { connectMongoDB };