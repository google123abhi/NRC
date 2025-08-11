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
    
    await mongoose.connect(mongoURI);
    
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
        employee_id: 'EMP002',
        username: 'meera.devi',
        password_hash: 'worker123',
        name: 'Meera Devi',
        role: 'anganwadi_worker',
        contact_number: '+91 9876543211',
        email: 'meera.devi@gov.in'
      },
      {
        employee_id: 'SUP001',
        username: 'supervisor1',
        password_hash: 'super123',
        name: 'Dr. Sunita Devi',
        role: 'supervisor',
        contact_number: '+91 9876543212',
        email: 'sunita.devi@gov.in'
      },
      {
        employee_id: 'SUP002',
        username: 'supervisor2',
        password_hash: 'super123',
        name: 'Dr. Rajesh Kumar',
        role: 'supervisor',
        contact_number: '+91 9876543213',
        email: 'rajesh.kumar@gov.in'
      },
      {
        employee_id: 'HOSP001',
        username: 'hospital1',
        password_hash: 'hosp123',
        name: 'Dr. Amit Sharma',
        role: 'hospital',
        contact_number: '+91 9876543214',
        email: 'amit.sharma@hospital.gov.in'
      },
      {
        employee_id: 'HOSP002',
        username: 'hospital2',
        password_hash: 'hosp123',
        name: 'Dr. Kavita Singh',
        role: 'hospital',
        contact_number: '+91 9876543215',
        email: 'kavita.singh@hospital.gov.in'
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
    const sampleAnganwadis = [
      {
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
      },
      {
        name: 'Anganwadi Center Civil Lines',
        code: 'AWC002',
        location: {
          area: 'Civil Lines',
          district: 'Meerut',
          state: 'Uttar Pradesh',
          pincode: '250002',
          coordinates: {
            latitude: 28.9950,
            longitude: 77.7150
          }
        },
        supervisor: {
          name: 'Mrs. Rajesh Kumar',
          contact_number: '+91 9876543214',
          employee_id: 'SUP002'
        },
        capacity: {
          pregnant_women: 40,
          children: 80
        },
        facilities: ['Kitchen', 'Medical Room', 'Toilet', 'Store Room'],
        coverage_areas: ['Civil Lines', 'Cantonment', 'Mall Road'],
        established_date: new Date('2019-06-10')
      }
    ];
    
    const anganwadis = await AnganwadiCenter.insertMany(sampleAnganwadis);
    console.log('✅ Sample anganwadi centers created');
    
    // Create sample workers
    const sampleWorkers = [
      {
        employee_id: 'WRK001',
        name: 'Priya Sharma',
        role: 'helper',
        anganwadi_id: anganwadis[0]._id,
        contact_number: '+91 9876543210',
        address: 'House No. 123, Sadar Bazaar, Meerut',
        assigned_areas: ['Sadar Bazaar', 'Civil Lines'],
        qualifications: ['ANM Certification', 'Child Care Training'],
        working_hours: {
          start: '09:00',
          end: '17:00'
        },
        emergency_contact: {
          name: 'Raj Sharma',
          relation: 'Husband',
          contact_number: '+91 9876543220'
        },
        join_date: new Date('2022-01-15')
      },
      {
        employee_id: 'WRK002',
        name: 'Meera Devi',
        role: 'asha',
        anganwadi_id: anganwadis[0]._id,
        contact_number: '+91 9876543211',
        address: 'House No. 456, Shastri Nagar, Meerut',
        assigned_areas: ['Shastri Nagar'],
        qualifications: ['ASHA Training', 'Community Health'],
        working_hours: {
          start: '08:00',
          end: '16:00'
        },
        emergency_contact: {
          name: 'Ram Devi',
          relation: 'Mother',
          contact_number: '+91 9876543221'
        },
        join_date: new Date('2021-08-20')
      },
      {
        employee_id: 'WRK003',
        name: 'Sunita Kumari',
        role: 'head',
        anganwadi_id: anganwadis[1]._id,
        contact_number: '+91 9876543212',
        address: 'House No. 789, Civil Lines, Meerut',
        assigned_areas: ['Civil Lines', 'Cantonment'],
        qualifications: ['ANM Certification', 'Management Training', 'Nutrition Specialist'],
        working_hours: {
          start: '09:00',
          end: '18:00'
        },
        emergency_contact: {
          name: 'Vikash Kumar',
          relation: 'Husband',
          contact_number: '+91 9876543222'
        },
        join_date: new Date('2020-03-10')
      }
    ];
    
    const workers = await Worker.insertMany(sampleWorkers);
    console.log('✅ Sample workers created');
    
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
        number: '103',
        ward: 'Pediatric',
        status: 'maintenance'
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
      },
      {
        hospital_id: hospital._id,
        number: '203',
        ward: 'Maternity',
        status: 'available'
      }
    ];
    
    const beds = await Bed.insertMany(sampleBeds);
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
      },
      {
        registration_number: 'NRC003',
        aadhaar_number: '3456-7890-1234',
        name: 'Ravi Singh',
        age: 2,
        type: 'child',
        contact_number: '+91 9876543218',
        emergency_contact: '+91 9876543219',
        address: 'House No. 789, Shastri Nagar, Meerut',
        weight: 7.2,
        height: 78,
        nutrition_status: 'severely_malnourished',
        medical_history: ['Diarrhea', 'Respiratory infections'],
        symptoms: ['Stunted growth', 'Frequent illness'],
        risk_score: 90,
        nutritional_deficiency: ['Protein', 'Iron', 'Vitamin A', 'Zinc'],
        registered_by: 'EMP002'
      }
    ];
    
    const patients = await Patient.insertMany(samplePatients);
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
      },
      {
        user_role: 'hospital',
        type: 'admission_status',
        title: 'New Patient Admission',
        message: 'Ravi Singh admitted to Pediatric Ward, Bed 102',
        priority: 'medium',
        action_required: false
      }
    ];
    
    await Notification.insertMany(sampleNotifications);
    console.log('✅ Sample notifications created');
    
    // Create sample bed requests
    const sampleBedRequests = [
      {
        patient_id: patients[0]._id,
        requested_by: 'EMP001',
        urgency_level: 'high',
        medical_justification: 'Severely malnourished child with 85% risk score requiring immediate intervention',
        current_condition: 'Child showing signs of severe malnutrition with weight loss and frequent infections',
        estimated_stay_duration: 21,
        special_requirements: 'Requires 24-hour monitoring and therapeutic feeding',
        status: 'pending'
      },
      {
        patient_id: patients[1]._id,
        requested_by: 'EMP001',
        urgency_level: 'medium',
        medical_justification: 'Pregnant woman with malnutrition requiring nutritional support',
        current_condition: 'Pregnant woman at 28 weeks with anemia and nutritional deficiency',
        estimated_stay_duration: 14,
        special_requirements: 'Prenatal care and iron supplementation',
        status: 'approved',
        reviewed_by: 'SUP001',
        review_date: new Date(),
        review_comments: 'Approved for immediate admission to Maternity Ward'
      }
    ];
    
    await BedRequest.insertMany(sampleBedRequests);
    console.log('✅ Sample bed requests created');
    
    // Create sample visits
    const sampleVisits = [
      {
        patient_id: patients[0]._id,
        health_worker_id: 'EMP001',
        scheduled_date: new Date(),
        status: 'scheduled'
      },
      {
        patient_id: patients[1]._id,
        health_worker_id: 'EMP001',
        scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled'
      },
      {
        patient_id: patients[2]._id,
        health_worker_id: 'EMP002',
        scheduled_date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        actual_date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'completed',
        notes: 'Patient condition improved, continuing treatment plan'
      }
    ];
    
    await Visit.insertMany(sampleVisits);
    console.log('✅ Sample visits created');
    
    console.log('🎉 Sample data initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
};

module.exports = { connectMongoDB };