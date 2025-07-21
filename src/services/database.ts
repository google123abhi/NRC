// Database service for NRC Management System
// This would connect to your actual database (PostgreSQL, MySQL, etc.)

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Mock database service - replace with actual database connection
class DatabaseService {
  private config: DatabaseConfig;
  private isConnected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // In a real implementation, you would connect to your database here
      // Example with pg (PostgreSQL):
      // this.client = new Client(this.config);
      // await this.client.connect();
      
      console.log('Database connected successfully');
      this.isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      // await this.client.end();
      this.isConnected = false;
      console.log('Database disconnected');
    }
  }

  // Generic query method
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      // In a real implementation:
      // const result = await this.client.query(sql, params);
      // return result.rows;
      
      console.log('Executing query:', sql, params);
      return [] as T[];
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  // Transaction support
  async transaction<T>(callback: (query: (sql: string, params?: any[]) => Promise<any[]>) => Promise<T>): Promise<T> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      // await this.client.query('BEGIN');
      const result = await callback(this.query.bind(this));
      // await this.client.query('COMMIT');
      return result;
    } catch (error) {
      // await this.client.query('ROLLBACK');
      throw error;
    }
  }
}

// Patient operations
export class PatientService {
  constructor(private db: DatabaseService) {}

  async getAllPatients() {
    return this.db.query(`
      SELECT p.*, 
             b.number as bed_number, 
             b.ward as bed_ward,
             h.name as hospital_name
      FROM patients p
      LEFT JOIN beds b ON p.bed_id = b.id
      LEFT JOIN hospitals h ON b.hospital_id = h.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `);
  }

  async getPatientById(id: string) {
    const result = await this.db.query(`
      SELECT p.*, 
             b.number as bed_number, 
             b.ward as bed_ward,
             h.name as hospital_name
      FROM patients p
      LEFT JOIN beds b ON p.bed_id = b.id
      LEFT JOIN hospitals h ON b.hospital_id = h.id
      WHERE p.id = $1 AND p.is_active = true
    `, [id]);
    
    return result[0] || null;
  }

  async createPatient(patientData: any) {
    return this.db.query(`
      INSERT INTO patients (
        registration_number, aadhaar_number, name, age, type, pregnancy_week,
        contact_number, emergency_contact, address, weight, height, blood_pressure,
        temperature, hemoglobin, nutrition_status, medical_history, symptoms,
        documents, photos, remarks, risk_score, nutritional_deficiency,
        registered_by, registration_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24
      ) RETURNING *
    `, [
      patientData.registrationNumber,
      patientData.aadhaarNumber,
      patientData.name,
      patientData.age,
      patientData.type,
      patientData.pregnancyWeek,
      patientData.contactNumber,
      patientData.emergencyContact,
      patientData.address,
      patientData.weight,
      patientData.height,
      patientData.bloodPressure,
      patientData.temperature,
      patientData.hemoglobin,
      patientData.nutritionStatus,
      patientData.medicalHistory,
      patientData.symptoms,
      patientData.documents,
      patientData.photos,
      patientData.remarks,
      patientData.riskScore,
      patientData.nutritionalDeficiency,
      patientData.registeredBy,
      patientData.registrationDate
    ]);
  }

  async updatePatient(id: string, updates: any) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    return this.db.query(`
      UPDATE patients 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `, [id, ...Object.values(updates)]);
  }

  async deletePatient(id: string) {
    return this.db.query(`
      UPDATE patients 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);
  }
}

// Medical Records operations
export class MedicalRecordService {
  constructor(private db: DatabaseService) {}

  async getPatientMedicalHistory(patientId: string) {
    const records = await this.db.query(`
      SELECT mr.*, 
             array_agg(
               json_build_object(
                 'name', m.name,
                 'dosage', m.dosage,
                 'frequency', m.frequency,
                 'duration', m.duration
               )
             ) as medications
      FROM medical_records mr
      LEFT JOIN medications m ON mr.id = m.medical_record_id
      WHERE mr.patient_id = $1
      GROUP BY mr.id
      ORDER BY mr.visit_date DESC
    `, [patientId]);

    return records;
  }

  async createMedicalRecord(recordData: any) {
    return this.db.transaction(async (query) => {
      // Insert medical record
      const recordResult = await query(`
        INSERT INTO medical_records (
          patient_id, visit_date, visit_type, health_worker_id, weight, height,
          temperature, blood_pressure, pulse, respiratory_rate, oxygen_saturation,
          symptoms, diagnosis, treatment, appetite, food_intake, supplements,
          diet_plan, hemoglobin, blood_sugar, protein_level, notes,
          next_visit_date, follow_up_required
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24
        ) RETURNING *
      `, [
        recordData.patientId,
        recordData.date,
        recordData.visitType,
        recordData.healthWorkerId,
        recordData.vitals.weight,
        recordData.vitals.height,
        recordData.vitals.temperature,
        recordData.vitals.bloodPressure,
        recordData.vitals.pulse,
        recordData.vitals.respiratoryRate,
        recordData.vitals.oxygenSaturation,
        recordData.symptoms,
        recordData.diagnosis,
        recordData.treatment,
        recordData.nutritionAssessment.appetite,
        recordData.nutritionAssessment.foodIntake,
        recordData.nutritionAssessment.supplements,
        recordData.nutritionAssessment.dietPlan,
        recordData.labResults?.hemoglobin,
        recordData.labResults?.bloodSugar,
        recordData.labResults?.proteinLevel,
        recordData.notes,
        recordData.nextVisitDate,
        recordData.followUpRequired
      ]);

      const recordId = recordResult[0].id;

      // Insert medications
      if (recordData.medications && recordData.medications.length > 0) {
        for (const medication of recordData.medications) {
          await query(`
            INSERT INTO medications (medical_record_id, name, dosage, frequency, duration)
            VALUES ($1, $2, $3, $4, $5)
          `, [recordId, medication.name, medication.dosage, medication.frequency, medication.duration]);
        }
      }

      // Update patient's last visit date
      await query(`
        UPDATE patients 
        SET last_visit_date = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [recordData.date, recordData.patientId]);

      return recordResult[0];
    });
  }
}

// Bed operations
export class BedService {
  constructor(private db: DatabaseService) {}

  async getAllBeds() {
    return this.db.query(`
      SELECT b.*, 
             h.name as hospital_name,
             p.name as patient_name,
             p.type as patient_type,
             p.nutrition_status
      FROM beds b
      JOIN hospitals h ON b.hospital_id = h.id
      LEFT JOIN patients p ON b.patient_id = p.id
      ORDER BY h.name, b.ward, b.number
    `);
  }

  async updateBedStatus(bedId: string, updates: any) {
    return this.db.transaction(async (query) => {
      // Update bed
      const result = await query(`
        UPDATE beds 
        SET status = $1, patient_id = $2, admission_date = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `, [updates.status, updates.patientId, updates.admissionDate, bedId]);

      // If assigning patient to bed, update patient record
      if (updates.patientId) {
        await query(`
          UPDATE patients 
          SET bed_id = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [bedId, updates.patientId]);
      }

      // If freeing bed, clear patient's bed assignment
      if (updates.status === 'available' && !updates.patientId) {
        await query(`
          UPDATE patients 
          SET bed_id = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE bed_id = $1
        `, [bedId]);
      }

      return result[0];
    });
  }
}

// Bed Request operations
export class BedRequestService {
  constructor(private db: DatabaseService) {}

  async getAllBedRequests() {
    return this.db.query(`
      SELECT br.*, 
             p.name as patient_name,
             p.type as patient_type,
             p.nutrition_status,
             u1.name as requested_by_name,
             u2.name as reviewed_by_name
      FROM bed_requests br
      JOIN patients p ON br.patient_id = p.id
      LEFT JOIN users u1 ON br.requested_by = u1.employee_id
      LEFT JOIN users u2 ON br.reviewed_by = u2.employee_id
      ORDER BY br.created_at DESC
    `);
  }

  async createBedRequest(requestData: any) {
    return this.db.query(`
      INSERT INTO bed_requests (
        patient_id, requested_by, request_date, urgency_level,
        medical_justification, current_condition, estimated_stay_duration,
        special_requirements, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      requestData.patientId,
      requestData.requestedBy,
      requestData.requestDate,
      requestData.urgencyLevel,
      requestData.medicalJustification,
      requestData.currentCondition,
      requestData.estimatedStayDuration,
      requestData.specialRequirements,
      requestData.status
    ]);
  }

  async updateBedRequest(requestId: string, updates: any) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    return this.db.query(`
      UPDATE bed_requests 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `, [requestId, ...Object.values(updates)]);
  }
}

// Visit operations
export class VisitService {
  constructor(private db: DatabaseService) {}

  async getAllVisits() {
    return this.db.query(`
      SELECT v.*, 
             p.name as patient_name,
             p.type as patient_type,
             u.name as health_worker_name
      FROM visits v
      JOIN patients p ON v.patient_id = p.id
      LEFT JOIN users u ON v.health_worker_id = u.employee_id
      ORDER BY v.scheduled_date DESC
    `);
  }

  async createVisit(visitData: any) {
    return this.db.query(`
      INSERT INTO visits (patient_id, health_worker_id, scheduled_date, status, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      visitData.patientId,
      visitData.healthWorkerId,
      visitData.scheduledDate,
      visitData.status,
      visitData.notes
    ]);
  }

  async updateVisit(visitId: string, updates: any) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    return this.db.query(`
      UPDATE visits 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `, [visitId, ...Object.values(updates)]);
  }
}

// Notification operations
export class NotificationService {
  constructor(private db: DatabaseService) {}

  async getNotificationsByRole(userRole: string) {
    return this.db.query(`
      SELECT * FROM notifications 
      WHERE user_role = $1 
      ORDER BY created_at DESC
    `, [userRole]);
  }

  async createNotification(notificationData: any) {
    return this.db.query(`
      INSERT INTO notifications (user_role, type, title, message, priority, action_required, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      notificationData.userRole,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.priority,
      notificationData.actionRequired,
      notificationData.date
    ]);
  }

  async markAsRead(notificationId: string) {
    return this.db.query(`
      UPDATE notifications 
      SET read = true 
      WHERE id = $1
    `, [notificationId]);
  }
}

// Export database service instance
export const createDatabaseService = (config: DatabaseConfig) => {
  const db = new DatabaseService(config);
  
  return {
    db,
    patients: new PatientService(db),
    medicalRecords: new MedicalRecordService(db),
    beds: new BedService(db),
    bedRequests: new BedRequestService(db),
    visits: new VisitService(db),
    notifications: new NotificationService(db),
  };
};

// Example usage:
/*
const dbConfig: DatabaseConfig = {
  host: 'localhost',
  port: 5432,
  database: 'nrc_management',
  username: 'your_username',
  password: 'your_password'
};

const services = createDatabaseService(dbConfig);

// Initialize connection
await services.db.connect();

// Use services
const patients = await services.patients.getAllPatients();
const newPatient = await services.patients.createPatient(patientData);
*/