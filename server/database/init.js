const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/nrc_management.db';

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('📁 Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

const initializeDatabase = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      employee_id TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('anganwadi_worker', 'supervisor', 'hospital')),
      contact_number TEXT,
      email TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Anganwadi Centers table
  db.run(`
    CREATE TABLE IF NOT EXISTS anganwadi_centers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      location_area TEXT NOT NULL,
      location_district TEXT NOT NULL,
      location_state TEXT NOT NULL,
      location_pincode TEXT,
      latitude REAL,
      longitude REAL,
      supervisor_name TEXT,
      supervisor_contact TEXT,
      supervisor_employee_id TEXT,
      capacity_pregnant_women INTEGER DEFAULT 0,
      capacity_children INTEGER DEFAULT 0,
      facilities TEXT, -- JSON array
      coverage_areas TEXT, -- JSON array
      established_date DATE,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Workers table
  db.run(`
    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      employee_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('head', 'supervisor', 'helper', 'asha')),
      anganwadi_id TEXT,
      contact_number TEXT NOT NULL,
      address TEXT,
      assigned_areas TEXT, -- JSON array
      qualifications TEXT, -- JSON array
      working_hours_start TEXT,
      working_hours_end TEXT,
      emergency_contact_name TEXT,
      emergency_contact_relation TEXT,
      emergency_contact_number TEXT,
      join_date DATE DEFAULT (date('now')),
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (anganwadi_id) REFERENCES anganwadi_centers(id)
    )
  `);

  // Patients table
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      registration_number TEXT UNIQUE NOT NULL,
      aadhaar_number TEXT UNIQUE,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('child', 'pregnant')),
      pregnancy_week INTEGER,
      contact_number TEXT NOT NULL,
      emergency_contact TEXT,
      address TEXT NOT NULL,
      weight REAL NOT NULL,
      height REAL NOT NULL,
      blood_pressure TEXT,
      temperature REAL,
      hemoglobin REAL,
      nutrition_status TEXT NOT NULL CHECK (nutrition_status IN ('normal', 'malnourished', 'severely_malnourished')),
      medical_history TEXT, -- JSON array
      symptoms TEXT, -- JSON array
      documents TEXT, -- JSON array
      photos TEXT, -- JSON array
      remarks TEXT,
      risk_score INTEGER DEFAULT 0,
      nutritional_deficiency TEXT, -- JSON array
      bed_id TEXT,
      last_visit_date DATE,
      next_visit_date DATE,
      registered_by TEXT,
      registration_date DATE DEFAULT (date('now')),
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (registered_by) REFERENCES users(employee_id)
    )
  `);

  // Medical Records table
  db.run(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      visit_date DATE NOT NULL DEFAULT (date('now')),
      visit_type TEXT NOT NULL CHECK (visit_type IN ('routine', 'emergency', 'follow_up', 'admission', 'discharge')),
      health_worker_id TEXT,
      weight REAL NOT NULL,
      height REAL NOT NULL,
      temperature REAL,
      blood_pressure TEXT,
      pulse INTEGER,
      respiratory_rate INTEGER,
      oxygen_saturation INTEGER,
      symptoms TEXT, -- JSON array
      diagnosis TEXT, -- JSON array
      treatment TEXT, -- JSON array
      medications TEXT, -- JSON array
      appetite TEXT CHECK (appetite IN ('poor', 'moderate', 'good')),
      food_intake TEXT CHECK (food_intake IN ('inadequate', 'adequate', 'excessive')),
      supplements TEXT, -- JSON array
      diet_plan TEXT,
      hemoglobin REAL,
      blood_sugar REAL,
      protein_level REAL,
      notes TEXT,
      next_visit_date DATE,
      follow_up_required BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (health_worker_id) REFERENCES users(employee_id)
    )
  `);

  // Beds table
  db.run(`
    CREATE TABLE IF NOT EXISTS beds (
      id TEXT PRIMARY KEY,
      hospital_id TEXT NOT NULL,
      number TEXT NOT NULL,
      ward TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
      patient_id TEXT,
      admission_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      UNIQUE(hospital_id, number)
    )
  `);

  // Visits table
  db.run(`
    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      health_worker_id TEXT,
      scheduled_date DATE NOT NULL,
      actual_date DATE,
      status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'rescheduled')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (health_worker_id) REFERENCES users(employee_id)
    )
  `);

  // Notifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_role TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
      action_required BOOLEAN DEFAULT 0,
      read BOOLEAN DEFAULT 0,
      date DATE DEFAULT (date('now')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample data
  insertSampleData();
};

const insertSampleData = () => {
  // Sample hospitals (for bed management)
  const hospitals = [
    { id: 'hosp-001', name: 'Government Hospital Patna', code: 'HOSP001' },
    { id: 'hosp-002', name: 'District Hospital Meerut', code: 'HOSP002' }
  ];

  // Sample anganwadi centers
  const anganwadis = [
    {
      id: 'awc-001',
      name: 'Anganwadi Center Sadar',
      code: 'AWC001',
      location_area: 'Sadar Bazaar',
      location_district: 'Meerut',
      location_state: 'Uttar Pradesh',
      location_pincode: '250001',
      supervisor_name: 'Sunita Devi',
      supervisor_contact: '+91 9876543210',
      capacity_pregnant_women: 25,
      capacity_children: 50,
      facilities: JSON.stringify(['Kitchen', 'Playground', 'Medical Room', 'Toilet']),
      coverage_areas: JSON.stringify(['Sadar Bazaar', 'Civil Lines', 'Shastri Nagar']),
      established_date: '2020-01-15'
    }
  ];

  // Sample users
  const users = [
    {
      id: 'user-001',
      employee_id: 'EMP001',
      username: 'priya.sharma',
      password_hash: '$2b$12$hash1',
      name: 'Priya Sharma',
      role: 'anganwadi_worker',
      contact_number: '+91 9876543210'
    },
    {
      id: 'user-002',
      employee_id: 'SUP001',
      username: 'supervisor1',
      password_hash: '$2b$12$hash2',
      name: 'Dr. Sunita Devi',
      role: 'supervisor',
      contact_number: '+91 9876543212'
    },
    {
      id: 'user-003',
      employee_id: 'HOSP001',
      username: 'hospital1',
      password_hash: '$2b$12$hash3',
      name: 'Dr. Amit Sharma',
      role: 'hospital',
      contact_number: '+91 9876543213'
    }
  ];

  // Sample beds
  const beds = [
    { id: 'bed-001', hospital_id: 'hosp-001', number: 'B001', ward: 'Pediatric', status: 'available' },
    { id: 'bed-002', hospital_id: 'hosp-001', number: 'B002', ward: 'Pediatric', status: 'available' },
    { id: 'bed-003', hospital_id: 'hosp-001', number: 'M001', ward: 'Maternity', status: 'available' },
    { id: 'bed-004', hospital_id: 'hosp-001', number: 'M002', ward: 'Maternity', status: 'occupied' }
  ];

  // Insert sample data
  anganwadis.forEach(anganwadi => {
    db.run(`INSERT OR IGNORE INTO anganwadi_centers (
      id, name, code, location_area, location_district, location_state, 
      location_pincode, supervisor_name, supervisor_contact, capacity_pregnant_women, 
      capacity_children, facilities, coverage_areas, established_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    Object.values(anganwadi));
  });

  users.forEach(user => {
    db.run(`INSERT OR IGNORE INTO users (
      id, employee_id, username, password_hash, name, role, contact_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    Object.values(user));
  });

  beds.forEach(bed => {
    db.run(`INSERT OR IGNORE INTO beds (
      id, hospital_id, number, ward, status
    ) VALUES (?, ?, ?, ?, ?)`, 
    Object.values(bed));
  });

  console.log('✅ Sample data inserted');
};

module.exports = { db, initializeDatabase };