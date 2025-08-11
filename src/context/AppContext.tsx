import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface Patient {
  id: string;
  registrationNumber: string;
  aadhaarNumber: string;
  name: string;
  age: number;
  type: 'child' | 'pregnant';
  pregnancyWeek?: number;
  contactNumber: string;
  emergencyContact?: string;
  address: string;
  weight: number;
  height: number;
  bloodPressure?: string;
  temperature?: number;
  hemoglobin?: number;
  nutritionStatus: 'normal' | 'malnourished' | 'severely_malnourished';
  medicalHistory: string[];
  symptoms: string[];
  documents: string[];
  photos: string[];
  remarks?: string;
  riskScore?: number;
  nutritionalDeficiency?: string[];
  bedId?: string;
  lastVisitDate?: string;
  nextVisitDate?: string;
  registeredBy?: string;
  registrationDate: string;
  admissionDate: string;
  nextVisit: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  visitType: 'routine' | 'emergency' | 'follow_up' | 'admission' | 'discharge';
  healthWorkerId: string;
  vitals: {
    weight: number;
    height: number;
    temperature?: number;
    bloodPressure?: string;
    pulse?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  symptoms: string[];
  diagnosis: string[];
  treatment: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  nutritionAssessment: {
    appetite: 'poor' | 'moderate' | 'good';
    foodIntake: 'inadequate' | 'adequate' | 'excessive';
    supplements: string[];
    dietPlan?: string;
  };
  labResults?: {
    hemoglobin?: number;
    bloodSugar?: number;
    proteinLevel?: number;
  };
  notes?: string;
  nextVisitDate?: string;
  followUpRequired: boolean;
}

export interface Bed {
  id: string;
  hospitalId: string;
  number: string;
  ward: string;
  status: 'available' | 'occupied' | 'maintenance';
  patientId?: string;
  admissionDate?: string;
}

export interface BedRequest {
  id: string;
  patientId: string;
  requestedBy: string;
  requestDate: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  medicalJustification: string;
  currentCondition: string;
  estimatedStayDuration: number;
  specialRequirements?: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  reviewedBy?: string;
  reviewDate?: string;
  reviewComments?: string;
  hospitalReferral?: {
    hospitalName: string;
    contactNumber: string;
    referralReason: string;
    referralDate: string;
    urgencyLevel: 'routine' | 'urgent' | 'emergency';
  };
}

export interface Visit {
  id: string;
  patientId: string;
  healthWorkerId: string;
  scheduledDate: string;
  actualDate?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  notes?: string;
}

export interface Notification {
  id: string;
  userRole: string;
  type: 'admission_status' | 'bed_approval' | 'supervisor_instruction' | 'high_risk_alert' | 'bed_request' | 'discharge_tracking';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  read: boolean;
  date: string;
}

export interface TreatmentTracker {
  id: string;
  patientId: string;
  hospitalId: string;
  admissionDate: string;
  dischargeDate?: string;
  treatmentPlan: string[];
  medicineSchedule: {
    medicine: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
  }[];
  doctorRemarks: string[];
  dailyProgress: {
    date: string;
    weight: number;
    appetite: 'poor' | 'moderate' | 'good';
    notes: string;
  }[];
  labReports: {
    type: string;
    date: string;
    results: string;
  }[];
  dischargeSummary?: {
    finalWeight: number;
    healthImprovement: string;
    followUpInstructions: string[];
    nextCheckupDate: string;
  };
}

export interface Anganwadi {
  id: string;
  name: string;
  code: string;
  location: {
    area: string;
    district: string;
    state: string;
    pincode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  supervisor: {
    name: string;
    contactNumber: string;
    employeeId: string;
  };
  capacity: {
    pregnantWomen: number;
    children: number;
  };
  facilities: string[];
  coverageAreas: string[];
  establishedDate: string;
  isActive: boolean;
}

export interface Worker {
  id: string;
  employeeId: string;
  name: string;
  role: 'head' | 'supervisor' | 'helper' | 'asha';
  anganwadiId?: string;
  contactNumber: string;
  address?: string;
  assignedAreas: string[];
  qualifications: string[];
  workingHours: {
    start: string;
    end: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    contactNumber: string;
  };
  joinDate: string;
  isActive: boolean;
}

export interface SurveyReport {
  id: string;
  patientId: string;
  healthWorkerId: string;
  date: string;
  observations: string;
  nutritionData: {
    appetite: 'poor' | 'moderate' | 'good';
    foodIntake: 'inadequate' | 'adequate' | 'excessive';
    supplements: string[];
  };
  symptoms: string[];
  recommendations: string[];
}

export interface MissedVisitTicket {
  id: string;
  patientId: string;
  visitId: string;
  dateReported: string;
  reportedBy: string;
  missedConditions: {
    patientNotAvailable: boolean;
    patientRefused: boolean;
    familyNotCooperative: boolean;
    transportIssues: boolean;
    weatherConditions: boolean;
    patientIll: boolean;
    familyEmergency: boolean;
    workCommitments: boolean;
    lackOfAwareness: boolean;
    other: boolean;
  };
  attemptDetails: {
    timeOfAttempt: string;
    locationVisited: string;
    contactMethod: 'phone_call' | 'home_visit' | 'community_contact';
  };
  patientCondition: {
    currentHealthStatus: 'stable' | 'deteriorating' | 'critical' | 'unknown';
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    visibleSymptoms: string[];
    familyReportedConcerns: string[];
  };
  actionsTaken: string[];
  followUpRequired: boolean;
  nextAttemptDate: string;
  supervisorNotified: boolean;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  escalationLevel: 'none' | 'supervisor' | 'district' | 'state';
  supervisorComments?: string;
}

export interface AnganwadiVisitTicket {
  id: string;
  anganwadiId: string;
  workerId: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedArea: string;
  visitType: 'routine_checkup' | 'nutrition_survey' | 'vaccination' | 'emergency' | 'follow_up';
  targetBeneficiaries: {
    pregnantWomen: number;
    children: number;
  };
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  reportedBy: string;
  reportedDate: string;
  escalationLevel: 'none' | 'supervisor' | 'district' | 'state';
  completionDetails?: {
    actualStartTime: string;
    actualEndTime: string;
    beneficiariesCovered: {
      pregnantWomen: number;
      children: number;
    };
    activitiesCompleted: string[];
    issuesEncountered: string[];
    followUpRequired: boolean;
    nextVisitDate?: string;
  };
  missedReason?: {
    workerUnavailable: boolean;
    transportIssues: boolean;
    weatherConditions: boolean;
    communityResistance: boolean;
    lackOfResources: boolean;
    emergencyElsewhere: boolean;
    other: boolean;
    otherDescription?: string;
  };
  supervisorComments?: string;
}

export interface HealthPrediction {
  id: string;
  patientId: string;
  date: string;
  predictedRecoveryDays: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

interface AppContextType {
  // State
  patients: Patient[];
  medicalRecords: MedicalRecord[];
  beds: Bed[];
  bedRequests: BedRequest[];
  visits: Visit[];
  notifications: Notification[];
  treatmentTrackers: TreatmentTracker[];
  anganwadis: Anganwadi[];
  workers: Worker[];
  surveys: SurveyReport[];
  missedVisitTickets: MissedVisitTicket[];
  visitTickets: AnganwadiVisitTicket[];
  aiPredictions: HealthPrediction[];
  
  // User management
  currentUser: any;
  userRole: 'anganwadi_worker' | 'supervisor' | 'hospital' | null;
  language: 'en' | 'hi';
  
  // Actions
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => Promise<void>;
  getPatientMedicalHistory: (patientId: string) => MedicalRecord[];
  updateBed: (id: string, updates: Partial<Bed>) => Promise<void>;
  addBedRequest: (request: Omit<BedRequest, 'id'>) => Promise<void>;
  updateBedRequest: (id: string, updates: Partial<BedRequest>) => Promise<void>;
  addVisit: (visit: Omit<Visit, 'id'>) => Promise<void>;
  updateVisit: (id: string, updates: Partial<Visit>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id'>) => Promise<void>;
  addTreatmentTracker: (tracker: Omit<TreatmentTracker, 'id'>) => void;
  updateTreatmentTracker: (id: string, updates: Partial<TreatmentTracker>) => void;
  addAnganwadi: (anganwadi: Omit<Anganwadi, 'id'>) => Promise<void>;
  updateAnganwadi: (id: string, updates: Partial<Anganwadi>) => Promise<void>;
  addWorker: (worker: Omit<Worker, 'id'>) => Promise<void>;
  updateWorker: (id: string, updates: Partial<Worker>) => Promise<void>;
  addSurvey: (survey: Omit<SurveyReport, 'id'>) => void;
  addMissedVisitTicket: (ticket: Omit<MissedVisitTicket, 'id'>) => void;
  updateMissedVisitTicket: (id: string, updates: Partial<MissedVisitTicket>) => void;
  addVisitTicket: (ticket: Omit<AnganwadiVisitTicket, 'id'>) => void;
  updateVisitTicket: (id: string, updates: Partial<AnganwadiVisitTicket>) => void;
  addAIPrediction: (prediction: Omit<HealthPrediction, 'id'>) => void;
  
  // User actions
  setCurrentUser: (user: any, role: 'anganwadi_worker' | 'supervisor' | 'hospital') => void;
  logout: () => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  hasAccess: (feature: string) => boolean;
  t: (key: string, params?: any) => string;
}

// Translations
const translations = {
  en: {
    system: {
      title: 'AI-Assisted NRC Management System',
      subtitle: 'Comprehensive healthcare management for malnutrition cases'
    },
    nav: {
      dashboard: 'Dashboard',
      patientRegistration: 'Patient Registration',
      medicalRecords: 'Medical Records',
      visitScheduling: 'Visit Scheduling',
      bedAvailability: 'Bed Availability',
      notifications: 'Notifications',
      postHospitalization: 'Post-Hospitalization',
      aiPrediction: 'AI Health Prediction',
      centerManagement: 'Center Management',
      workerManagement: 'Worker Management',
      visitTicketing: 'Visit Ticketing',
      surveyManagement: 'Survey Management',
      bedCoordination: 'Bed Coordination',
      admissionTracking: 'Admission Tracking',
      bedRequests: 'Bed Requests',
      bedDashboard: 'Bed Dashboard',
      treatmentTracker: 'Treatment Tracker',
      medicalReports: 'Medical Reports',
      bedDemandPrediction: 'Bed Demand Prediction'
    },
    common: {
      name: 'Name',
      age: 'Age',
      contact: 'Contact',
      address: 'Address',
      weight: 'Weight',
      height: 'Height',
      status: 'Status',
      date: 'Date',
      time: 'Time',
      notes: 'Notes',
      actions: 'Actions',
      cancel: 'Cancel',
      submit: 'Submit',
      save: 'Save',
      edit: 'Edit',
      view: 'View',
      delete: 'Delete',
      update: 'Update',
      add: 'Add',
      filter: 'Filter',
      search: 'Search',
      all: 'All',
      yes: 'Yes',
      no: 'No',
      required: 'Required',
      optional: 'Optional',
      loading: 'Loading',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      confirm: 'Confirm',
      years: 'years',
      yearsOld: 'years old',
      commaSeparated: 'comma separated',
      scheduled: 'Scheduled',
      completed: 'Completed',
      pending: 'Pending',
      approved: 'Approved',
      declined: 'Declined',
      cancelled: 'Cancelled',
      missed: 'Missed',
      inProgress: 'In Progress',
      other: 'Other',
      more: 'more'
    },
    patient: {
      patient: 'Patient',
      patients: 'Patients',
      registration: 'Patient Registration',
      child: 'Child',
      pregnant: 'Pregnant Woman',
      children: 'Children',
      pregnantWomen: 'Pregnant Women',
      type: 'Type',
      pregnancyWeek: 'Pregnancy Week',
      weeks: 'weeks',
      nutritionStatus: 'Nutrition Status',
      normal: 'Normal',
      malnourished: 'Malnourished',
      severelyMalnourished: 'Severely Malnourished',
      bloodPressure: 'Blood Pressure',
      hemoglobin: 'Hemoglobin',
      medicalHistory: 'Medical History',
      nextVisit: 'Next Visit',
      admissionDate: 'Admission Date',
      basicInfo: 'Basic Information',
      healthInfo: 'Health Information',
      visitInfo: 'Visit Information',
      selectPatient: 'Select Patient',
      add: 'Add Patient',
      edit: 'Edit Patient',
      allTypes: 'All Types',
      allStatuses: 'All Statuses',
      searchPlaceholder: 'Search by name or contact...'
    }
  },
  hi: {
    system: {
      title: 'एआई-सहायक एनआरसी प्रबंधन प्रणाली',
      subtitle: 'कुपोषण मामलों के लिए व्यापक स्वास्थ्य सेवा प्रबंधन'
    },
    nav: {
      dashboard: 'डैशबोर्ड',
      patientRegistration: 'रोगी पंजीकरण',
      medicalRecords: 'चिकित्सा रिकॉर्ड',
      visitScheduling: 'यात्रा निर्धारण',
      bedAvailability: 'बिस्तर उपलब्धता',
      notifications: 'सूचनाएं',
      postHospitalization: 'अस्पताल के बाद',
      aiPrediction: 'एआई स्वास्थ्य भविष्यवाणी'
    },
    common: {
      name: 'नाम',
      age: 'आयु',
      contact: 'संपर्क',
      address: 'पता',
      weight: 'वजन',
      height: 'ऊंचाई',
      status: 'स्थिति',
      date: 'दिनांक',
      time: 'समय',
      notes: 'टिप्पणियां',
      actions: 'कार्य',
      cancel: 'रद्द करें',
      submit: 'जमा करें',
      save: 'सहेजें',
      edit: 'संपादित करें',
      view: 'देखें',
      delete: 'हटाएं',
      update: 'अपडेट करें',
      add: 'जोड़ें',
      filter: 'फिल्टर',
      search: 'खोजें',
      all: 'सभी',
      yes: 'हां',
      no: 'नहीं',
      required: 'आवश्यक',
      optional: 'वैकल्पिक',
      loading: 'लोड हो रहा है',
      error: 'त्रुटि',
      success: 'सफलता',
      warning: 'चेतावनी',
      info: 'जानकारी',
      confirm: 'पुष्टि करें',
      years: 'वर्ष',
      yearsOld: 'वर्ष की आयु',
      commaSeparated: 'अल्पविराम से अलग'
    },
    patient: {
      patient: 'रोगी',
      patients: 'रोगी',
      registration: 'रोगी पंजीकरण',
      child: 'बच्चा',
      pregnant: 'गर्भवती महिला',
      children: 'बच्चे',
      pregnantWomen: 'गर्भवती महिलाएं',
      type: 'प्रकार',
      pregnancyWeek: 'गर्भावस्था सप्ताह',
      weeks: 'सप्ताह',
      nutritionStatus: 'पोषण स्थिति',
      normal: 'सामान्य',
      malnourished: 'कुपोषित',
      severelyMalnourished: 'गंभीर कुपोषित'
    }
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State - All data comes from MongoDB via Node.js server
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [bedRequests, setBedRequests] = useState<BedRequest[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [treatmentTrackers, setTreatmentTrackers] = useState<TreatmentTracker[]>([]);
  const [anganwadis, setAnganwadis] = useState<Anganwadi[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [surveys, setSurveys] = useState<SurveyReport[]>([]);
  const [missedVisitTickets, setMissedVisitTickets] = useState<MissedVisitTicket[]>([]);
  const [visitTickets, setVisitTickets] = useState<AnganwadiVisitTicket[]>([]);
  const [aiPredictions, setAiPredictions] = useState<HealthPrediction[]>([]);
  
  // User state
  const [currentUser, setCurrentUserState] = useState<any>(null);
  const [userRole, setUserRole] = useState<'anganwadi_worker' | 'supervisor' | 'hospital' | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // API Helper function - All data goes through Node.js server to MongoDB
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      console.log(`🌐 Frontend API Call: ${endpoint}`);
      console.log('📤 Request data:', options.body ? JSON.parse(options.body as string) : 'No body');
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📥 Response from server:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Frontend API Error for ${endpoint}:`, error);
      throw error;
    }
  };

  // Load all data from MongoDB via Node.js server
  useEffect(() => {
    const loadAllData = async () => {
      try {
        console.log('🔄 Loading all data from MongoDB via Node.js server...');
        
        // Load patients
        const patientsData = await apiCall('/patients');
        if (Array.isArray(patientsData)) {
          setPatients(patientsData.map(p => ({
            id: p._id,
            registrationNumber: p.registration_number,
            aadhaarNumber: p.aadhaar_number,
            name: p.name,
            age: p.age,
            type: p.type,
            pregnancyWeek: p.pregnancy_week,
            contactNumber: p.contact_number,
            emergencyContact: p.emergency_contact,
            address: p.address,
            weight: p.weight,
            height: p.height,
            bloodPressure: p.blood_pressure,
            temperature: p.temperature,
            hemoglobin: p.hemoglobin,
            nutritionStatus: p.nutrition_status,
            medicalHistory: p.medical_history || [],
            symptoms: p.symptoms || [],
            documents: p.documents || [],
            photos: p.photos || [],
            remarks: p.remarks,
            riskScore: p.risk_score,
            nutritionalDeficiency: p.nutritional_deficiency || [],
            bedId: p.bed_id,
            lastVisitDate: p.last_visit_date,
            nextVisitDate: p.next_visit_date,
            registeredBy: p.registered_by,
            registrationDate: p.registration_date,
            admissionDate: p.registration_date,
            nextVisit: p.next_visit_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })));
          console.log('✅ Patients loaded from MongoDB:', patientsData.length);
        }

        // Load beds
        const bedsData = await apiCall('/beds');
        if (Array.isArray(bedsData)) {
          setBeds(bedsData.map(b => ({
            id: b._id,
            hospitalId: b.hospital_id,
            number: b.number,
            ward: b.ward,
            status: b.status,
            patientId: b.patient_id,
            admissionDate: b.admission_date
          })));
          console.log('✅ Beds loaded from MongoDB:', bedsData.length);
        }

        // Load anganwadis
        const anganwadisData = await apiCall('/anganwadis');
        if (Array.isArray(anganwadisData)) {
          setAnganwadis(anganwadisData.map(a => ({
            id: a._id,
            name: a.name,
            code: a.code,
            location: {
              area: a.location.area,
              district: a.location.district,
              state: a.location.state,
              pincode: a.location.pincode,
              coordinates: {
                latitude: a.location.coordinates?.latitude || 0,
                longitude: a.location.coordinates?.longitude || 0
              }
            },
            supervisor: {
              name: a.supervisor.name,
              contactNumber: a.supervisor.contact_number,
              employeeId: a.supervisor.employee_id
            },
            capacity: {
              pregnantWomen: a.capacity.pregnant_women,
              children: a.capacity.children
            },
            facilities: a.facilities || [],
            coverageAreas: a.coverage_areas || [],
            establishedDate: a.established_date,
            isActive: a.is_active
          })));
          console.log('✅ Anganwadis loaded from MongoDB:', anganwadisData.length);
        }

        // Load workers
        const workersData = await apiCall('/workers');
        if (Array.isArray(workersData)) {
          setWorkers(workersData.map(w => ({
            id: w._id,
            employeeId: w.employee_id,
            name: w.name,
            role: w.role,
            anganwadiId: w.anganwadi_id,
            contactNumber: w.contact_number,
            address: w.address,
            assignedAreas: w.assigned_areas || [],
            qualifications: w.qualifications || [],
            workingHours: {
              start: w.working_hours?.start || '09:00',
              end: w.working_hours?.end || '17:00'
            },
            emergencyContact: {
              name: w.emergency_contact?.name || '',
              relation: w.emergency_contact?.relation || '',
              contactNumber: w.emergency_contact?.contact_number || ''
            },
            joinDate: w.join_date,
            isActive: w.is_active
          })));
          console.log('✅ Workers loaded from MongoDB:', workersData.length);
        }

        // Load bed requests
        const bedRequestsData = await apiCall('/bed-requests');
        if (Array.isArray(bedRequestsData)) {
          setBedRequests(bedRequestsData.map(br => ({
            id: br._id,
            patientId: br.patient_id,
            requestedBy: br.requested_by,
            requestDate: br.request_date,
            urgencyLevel: br.urgency_level,
            medicalJustification: br.medical_justification,
            currentCondition: br.current_condition,
            estimatedStayDuration: br.estimated_stay_duration,
            specialRequirements: br.special_requirements,
            status: br.status,
            reviewedBy: br.reviewed_by,
            reviewDate: br.review_date,
            reviewComments: br.review_comments,
            hospitalReferral: br.hospital_referral
          })));
          console.log('✅ Bed requests loaded from MongoDB:', bedRequestsData.length);
        }

        // Load notifications for current user role
        if (userRole) {
          const notificationsData = await apiCall(`/notifications/role/${userRole}`);
          if (Array.isArray(notificationsData)) {
            setNotifications(notificationsData.map(n => ({
              id: n._id,
              userRole: n.user_role,
              type: n.type,
              title: n.title,
              message: n.message,
              priority: n.priority,
              actionRequired: n.action_required,
              read: n.read,
              date: n.date
            })));
            console.log('✅ Notifications loaded from MongoDB:', notificationsData.length);
          }
        }

        // Load visits
        const visitsData = await apiCall('/visits');
        if (Array.isArray(visitsData)) {
          setVisits(visitsData.map(v => ({
            id: v._id,
            patientId: v.patient_id,
            healthWorkerId: v.health_worker_id,
            scheduledDate: v.scheduled_date,
            actualDate: v.actual_date,
            status: v.status,
            notes: v.notes
          })));
          console.log('✅ Visits loaded from MongoDB:', visitsData.length);
        }

        console.log('🎉 All data successfully loaded from MongoDB via Node.js server');
      } catch (error) {
        console.error('❌ Failed to load data from MongoDB:', error);
      }
    };

    loadAllData();
  }, [userRole]);

  // Actions - All operations go through Node.js server to MongoDB
  const addPatient = async (patient: Omit<Patient, 'id'>) => {
    try {
      console.log('📤 Frontend sending patient data to Node.js server:', patient);
      
      // Transform frontend data to server format
      const serverData = {
        name: patient.name,
        aadhaarNumber: patient.aadhaarNumber,
        age: patient.age,
        type: patient.type,
        pregnancyWeek: patient.pregnancyWeek,
        contactNumber: patient.contactNumber,
        emergencyContact: patient.emergencyContact,
        address: patient.address,
        weight: patient.weight,
        height: patient.height,
        bloodPressure: patient.bloodPressure,
        temperature: patient.temperature,
        hemoglobin: patient.hemoglobin,
        nutritionStatus: patient.nutritionStatus,
        medicalHistory: patient.medicalHistory,
        symptoms: patient.symptoms,
        documents: patient.documents,
        photos: patient.photos,
        remarks: patient.remarks,
        riskScore: patient.riskScore,
        nutritionalDeficiency: patient.nutritionalDeficiency,
        registeredBy: currentUser?.employeeId
      };

      const response = await apiCall('/patients', {
        method: 'POST',
        body: JSON.stringify(serverData),
      });

      if (response) {
        console.log('✅ Patient successfully saved to MongoDB via Node.js server');
        // Reload patients from MongoDB
        const updatedPatients = await apiCall('/patients');
        if (Array.isArray(updatedPatients)) {
          setPatients(updatedPatients.map(p => ({
            id: p._id,
            registrationNumber: p.registration_number,
            aadhaarNumber: p.aadhaar_number,
            name: p.name,
            age: p.age,
            type: p.type,
            pregnancyWeek: p.pregnancy_week,
            contactNumber: p.contact_number,
            emergencyContact: p.emergency_contact,
            address: p.address,
            weight: p.weight,
            height: p.height,
            bloodPressure: p.blood_pressure,
            temperature: p.temperature,
            hemoglobin: p.hemoglobin,
            nutritionStatus: p.nutrition_status,
            medicalHistory: p.medical_history || [],
            symptoms: p.symptoms || [],
            documents: p.documents || [],
            photos: p.photos || [],
            remarks: p.remarks,
            riskScore: p.risk_score,
            nutritionalDeficiency: p.nutritional_deficiency || [],
            bedId: p.bed_id,
            lastVisitDate: p.last_visit_date,
            nextVisitDate: p.next_visit_date,
            registeredBy: p.registered_by,
            registrationDate: p.registration_date,
            admissionDate: p.registration_date,
            nextVisit: p.next_visit_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to add patient to MongoDB:', error);
      throw error;
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      console.log('📤 Frontend updating patient in MongoDB via Node.js server:', id, updates);
      
      const response = await apiCall(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('✅ Patient successfully updated in MongoDB');
        // Reload patients from MongoDB
        const updatedPatients = await apiCall('/patients');
        if (Array.isArray(updatedPatients)) {
          setPatients(updatedPatients.map(p => ({
            id: p._id,
            registrationNumber: p.registration_number,
            aadhaarNumber: p.aadhaar_number,
            name: p.name,
            age: p.age,
            type: p.type,
            pregnancyWeek: p.pregnancy_week,
            contactNumber: p.contact_number,
            emergencyContact: p.emergency_contact,
            address: p.address,
            weight: p.weight,
            height: p.height,
            bloodPressure: p.blood_pressure,
            temperature: p.temperature,
            hemoglobin: p.hemoglobin,
            nutritionStatus: p.nutrition_status,
            medicalHistory: p.medical_history || [],
            symptoms: p.symptoms || [],
            documents: p.documents || [],
            photos: p.photos || [],
            remarks: p.remarks,
            riskScore: p.risk_score,
            nutritionalDeficiency: p.nutritional_deficiency || [],
            bedId: p.bed_id,
            lastVisitDate: p.last_visit_date,
            nextVisitDate: p.next_visit_date,
            registeredBy: p.registered_by,
            registrationDate: p.registration_date,
            admissionDate: p.registration_date,
            nextVisit: p.next_visit_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to update patient in MongoDB:', error);
      throw error;
    }
  };

  const addMedicalRecord = async (record: Omit<MedicalRecord, 'id'>) => {
    try {
      console.log('📤 Frontend sending medical record to Node.js server:', record);
      
      const response = await apiCall('/medical-records', {
        method: 'POST',
        body: JSON.stringify(record),
      });

      if (response) {
        console.log('✅ Medical record successfully saved to MongoDB');
        // Reload medical records for this patient
        const updatedRecords = await apiCall(`/medical-records/patient/${record.patientId}`);
        if (Array.isArray(updatedRecords)) {
          setMedicalRecords(prev => [
            ...prev.filter(r => r.patientId !== record.patientId),
            ...updatedRecords.map(mr => ({
              id: mr._id,
              patientId: mr.patient_id,
              date: mr.visit_date,
              visitType: mr.visit_type,
              healthWorkerId: mr.health_worker_id,
              vitals: {
                weight: mr.weight,
                height: mr.height,
                temperature: mr.temperature,
                bloodPressure: mr.blood_pressure,
                pulse: mr.pulse,
                respiratoryRate: mr.respiratory_rate,
                oxygenSaturation: mr.oxygen_saturation
              },
              symptoms: mr.symptoms || [],
              diagnosis: mr.diagnosis || [],
              treatment: mr.treatment || [],
              medications: [], // Would need separate medications table
              nutritionAssessment: {
                appetite: mr.appetite,
                foodIntake: mr.food_intake,
                supplements: mr.supplements || [],
                dietPlan: mr.diet_plan
              },
              labResults: {
                hemoglobin: mr.hemoglobin,
                bloodSugar: mr.blood_sugar,
                proteinLevel: mr.protein_level
              },
              notes: mr.notes,
              nextVisitDate: mr.next_visit_date,
              followUpRequired: mr.follow_up_required
            }))
          ]);
        }
      }
    } catch (error) {
      console.error('❌ Failed to add medical record to MongoDB:', error);
      throw error;
    }
  };

  const getPatientMedicalHistory = (patientId: string): MedicalRecord[] => {
    return medicalRecords.filter(record => record.patientId === patientId);
  };

  const updateBed = async (id: string, updates: Partial<Bed>) => {
    try {
      console.log('📤 Frontend updating bed in MongoDB via Node.js server:', id, updates);
      
      const response = await apiCall(`/beds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('✅ Bed successfully updated in MongoDB');
        // Reload beds from MongoDB
        const updatedBeds = await apiCall('/beds');
        if (Array.isArray(updatedBeds)) {
          setBeds(updatedBeds.map(b => ({
            id: b._id,
            hospitalId: b.hospital_id,
            number: b.number,
            ward: b.ward,
            status: b.status,
            patientId: b.patient_id,
            admissionDate: b.admission_date
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to update bed in MongoDB:', error);
      throw error;
    }
  };

  const addBedRequest = async (request: Omit<BedRequest, 'id'>) => {
    try {
      console.log('📤 Frontend sending bed request to Node.js server:', request);
      
      const response = await apiCall('/bed-requests', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (response) {
        console.log('✅ Bed request successfully saved to MongoDB');
        // Reload bed requests from MongoDB
        const updatedRequests = await apiCall('/bed-requests');
        if (Array.isArray(updatedRequests)) {
          setBedRequests(updatedRequests.map(br => ({
            id: br._id,
            patientId: br.patient_id,
            requestedBy: br.requested_by,
            requestDate: br.request_date,
            urgencyLevel: br.urgency_level,
            medicalJustification: br.medical_justification,
            currentCondition: br.current_condition,
            estimatedStayDuration: br.estimated_stay_duration,
            specialRequirements: br.special_requirements,
            status: br.status,
            reviewedBy: br.reviewed_by,
            reviewDate: br.review_date,
            reviewComments: br.review_comments,
            hospitalReferral: br.hospital_referral
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to add bed request to MongoDB:', error);
      throw error;
    }
  };

  const updateBedRequest = async (id: string, updates: Partial<BedRequest>) => {
    try {
      console.log('📤 Frontend updating bed request in MongoDB via Node.js server:', id, updates);
      
      const response = await apiCall(`/bed-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('✅ Bed request successfully updated in MongoDB');
        // Reload bed requests from MongoDB
        const updatedRequests = await apiCall('/bed-requests');
        if (Array.isArray(updatedRequests)) {
          setBedRequests(updatedRequests.map(br => ({
            id: br._id,
            patientId: br.patient_id,
            requestedBy: br.requested_by,
            requestDate: br.request_date,
            urgencyLevel: br.urgency_level,
            medicalJustification: br.medical_justification,
            currentCondition: br.current_condition,
            estimatedStayDuration: br.estimated_stay_duration,
            specialRequirements: br.special_requirements,
            status: br.status,
            reviewedBy: br.reviewed_by,
            reviewDate: br.review_date,
            reviewComments: br.review_comments,
            hospitalReferral: br.hospital_referral
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to update bed request in MongoDB:', error);
      throw error;
    }
  };

  const addVisit = async (visit: Omit<Visit, 'id'>) => {
    try {
      console.log('📤 Frontend sending visit to Node.js server:', visit);
      
      const response = await apiCall('/visits', {
        method: 'POST',
        body: JSON.stringify(visit),
      });

      if (response) {
        console.log('✅ Visit successfully saved to MongoDB');
        // Reload visits from MongoDB
        const updatedVisits = await apiCall('/visits');
        if (Array.isArray(updatedVisits)) {
          setVisits(updatedVisits.map(v => ({
            id: v._id,
            patientId: v.patient_id,
            healthWorkerId: v.health_worker_id,
            scheduledDate: v.scheduled_date,
            actualDate: v.actual_date,
            status: v.status,
            notes: v.notes
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to add visit to MongoDB:', error);
      throw error;
    }
  };

  const updateVisit = async (id: string, updates: Partial<Visit>) => {
    try {
      console.log('📤 Frontend updating visit in MongoDB via Node.js server:', id, updates);
      
      const response = await apiCall(`/visits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('✅ Visit successfully updated in MongoDB');
        // Reload visits from MongoDB
        const updatedVisits = await apiCall('/visits');
        if (Array.isArray(updatedVisits)) {
          setVisits(updatedVisits.map(v => ({
            id: v._id,
            patientId: v.patient_id,
            healthWorkerId: v.health_worker_id,
            scheduledDate: v.scheduled_date,
            actualDate: v.actual_date,
            status: v.status,
            notes: v.notes
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to update visit in MongoDB:', error);
      throw error;
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      console.log('📤 Frontend marking notification as read in MongoDB via Node.js server:', id);
      
      const response = await apiCall(`/notifications/${id}/read`, {
        method: 'PUT',
      });

      if (response) {
        console.log('✅ Notification successfully marked as read in MongoDB');
        // Update local state immediately for better UX
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error('❌ Failed to mark notification as read in MongoDB:', error);
      throw error;
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id'>) => {
    try {
      console.log('📤 Frontend sending notification to Node.js server:', notification);
      
      const response = await apiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify(notification),
      });

      if (response) {
        console.log('✅ Notification successfully saved to MongoDB');
        // Reload notifications from MongoDB
        if (userRole) {
          const updatedNotifications = await apiCall(`/notifications/role/${userRole}`);
          if (Array.isArray(updatedNotifications)) {
            setNotifications(updatedNotifications.map(n => ({
              id: n._id,
              userRole: n.user_role,
              type: n.type,
              title: n.title,
              message: n.message,
              priority: n.priority,
              actionRequired: n.action_required,
              read: n.read,
              date: n.date
            })));
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to add notification to MongoDB:', error);
      throw error;
    }
  };

  const addTreatmentTracker = (tracker: Omit<TreatmentTracker, 'id'>) => {
    const id = Date.now().toString();
    setTreatmentTrackers(prev => [...prev, { ...tracker, id }]);
  };

  const updateTreatmentTracker = (id: string, updates: Partial<TreatmentTracker>) => {
    setTreatmentTrackers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addAnganwadi = async (anganwadi: Omit<Anganwadi, 'id'>) => {
    try {
      console.log('📤 Frontend sending anganwadi to Node.js server:', anganwadi);
      
      const response = await apiCall('/anganwadis', {
        method: 'POST',
        body: JSON.stringify(anganwadi),
      });

      if (response) {
        console.log('✅ Anganwadi successfully saved to MongoDB');
        // Reload anganwadis from MongoDB
        const updatedAnganwadis = await apiCall('/anganwadis');
        if (Array.isArray(updatedAnganwadis)) {
          setAnganwadis(updatedAnganwadis.map(a => ({
            id: a._id,
            name: a.name,
            code: a.code,
            location: {
              area: a.location.area,
              district: a.location.district,
              state: a.location.state,
              pincode: a.location.pincode,
              coordinates: {
                latitude: a.location.coordinates?.latitude || 0,
                longitude: a.location.coordinates?.longitude || 0
              }
            },
            supervisor: {
              name: a.supervisor.name,
              contactNumber: a.supervisor.contact_number,
              employeeId: a.supervisor.employee_id
            },
            capacity: {
              pregnantWomen: a.capacity.pregnant_women,
              children: a.capacity.children
            },
            facilities: a.facilities || [],
            coverageAreas: a.coverage_areas || [],
            establishedDate: a.established_date,
            isActive: a.is_active
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to add anganwadi to MongoDB:', error);
      throw error;
    }
  };

  const updateAnganwadi = async (id: string, updates: Partial<Anganwadi>) => {
    try {
      console.log('📤 Frontend updating anganwadi in MongoDB via Node.js server:', id, updates);
      
      const response = await apiCall(`/anganwadis/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('✅ Anganwadi successfully updated in MongoDB');
        // Reload anganwadis from MongoDB
        const updatedAnganwadis = await apiCall('/anganwadis');
        if (Array.isArray(updatedAnganwadis)) {
          setAnganwadis(updatedAnganwadis.map(a => ({
            id: a._id,
            name: a.name,
            code: a.code,
            location: {
              area: a.location.area,
              district: a.location.district,
              state: a.location.state,
              pincode: a.location.pincode,
              coordinates: {
                latitude: a.location.coordinates?.latitude || 0,
                longitude: a.location.coordinates?.longitude || 0
              }
            },
            supervisor: {
              name: a.supervisor.name,
              contactNumber: a.supervisor.contact_number,
              employeeId: a.supervisor.employee_id
            },
            capacity: {
              pregnantWomen: a.capacity.pregnant_women,
              children: a.capacity.children
            },
            facilities: a.facilities || [],
            coverageAreas: a.coverage_areas || [],
            establishedDate: a.established_date,
            isActive: a.is_active
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to update anganwadi in MongoDB:', error);
      throw error;
    }
  };

  const addWorker = async (worker: Omit<Worker, 'id'>) => {
    try {
      console.log('📤 Frontend sending worker to Node.js server:', worker);
      
      const response = await apiCall('/workers', {
        method: 'POST',
        body: JSON.stringify(worker),
      });

      if (response) {
        console.log('✅ Worker successfully saved to MongoDB');
        // Reload workers from MongoDB
        const updatedWorkers = await apiCall('/workers');
        if (Array.isArray(updatedWorkers)) {
          setWorkers(updatedWorkers.map(w => ({
            id: w._id,
            employeeId: w.employee_id,
            name: w.name,
            role: w.role,
            anganwadiId: w.anganwadi_id,
            contactNumber: w.contact_number,
            address: w.address,
            assignedAreas: w.assigned_areas || [],
            qualifications: w.qualifications || [],
            workingHours: {
              start: w.working_hours?.start || '09:00',
              end: w.working_hours?.end || '17:00'
            },
            emergencyContact: {
              name: w.emergency_contact?.name || '',
              relation: w.emergency_contact?.relation || '',
              contactNumber: w.emergency_contact?.contact_number || ''
            },
            joinDate: w.join_date,
            isActive: w.is_active
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to add worker to MongoDB:', error);
      throw error;
    }
  };

  const updateWorker = async (id: string, updates: Partial<Worker>) => {
    try {
      console.log('📤 Frontend updating worker in MongoDB via Node.js server:', id, updates);
      
      const response = await apiCall(`/workers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('✅ Worker successfully updated in MongoDB');
        // Reload workers from MongoDB
        const updatedWorkers = await apiCall('/workers');
        if (Array.isArray(updatedWorkers)) {
          setWorkers(updatedWorkers.map(w => ({
            id: w._id,
            employeeId: w.employee_id,
            name: w.name,
            role: w.role,
            anganwadiId: w.anganwadi_id,
            contactNumber: w.contact_number,
            address: w.address,
            assignedAreas: w.assigned_areas || [],
            qualifications: w.qualifications || [],
            workingHours: {
              start: w.working_hours?.start || '09:00',
              end: w.working_hours?.end || '17:00'
            },
            emergencyContact: {
              name: w.emergency_contact?.name || '',
              relation: w.emergency_contact?.relation || '',
              contactNumber: w.emergency_contact?.contact_number || ''
            },
            joinDate: w.join_date,
            isActive: w.is_active
          })));
        }
      }
    } catch (error) {
      console.error('❌ Failed to update worker in MongoDB:', error);
      throw error;
    }
  };

  const addSurvey = (survey: Omit<SurveyReport, 'id'>) => {
    const id = Date.now().toString();
    setSurveys(prev => [...prev, { ...survey, id }]);
  };

  const addMissedVisitTicket = (ticket: Omit<MissedVisitTicket, 'id'>) => {
    const id = Date.now().toString();
    setMissedVisitTickets(prev => [...prev, { ...ticket, id }]);
  };

  const updateMissedVisitTicket = (id: string, updates: Partial<MissedVisitTicket>) => {
    setMissedVisitTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addVisitTicket = (ticket: Omit<AnganwadiVisitTicket, 'id'>) => {
    const id = Date.now().toString();
    setVisitTickets(prev => [...prev, { ...ticket, id }]);
  };

  const updateVisitTicket = (id: string, updates: Partial<AnganwadiVisitTicket>) => {
    setVisitTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addAIPrediction = (prediction: Omit<HealthPrediction, 'id'>) => {
    const id = Date.now().toString();
    setAiPredictions(prev => [...prev, { ...prediction, id }]);
  };

  // User management
  const setCurrentUser = (user: any, role: 'anganwadi_worker' | 'supervisor' | 'hospital') => {
    setCurrentUserState(user);
    setUserRole(role);
  };

  const logout = () => {
    setCurrentUserState(null);
    setUserRole(null);
  };

  // Access control
  const hasAccess = (feature: string): boolean => {
    if (!userRole) return false;

    const permissions = {
      anganwadi_worker: [
        'dashboard', 'patientRegistration', 'medicalRecords', 'visitScheduling',
        'bedAvailability', 'notifications', 'aiPrediction', 'postHospitalization'
      ],
      supervisor: [
        'dashboard', 'centerManagement', 'workerManagement', 'patientRegistration',
        'medicalRecords', 'visitTicketing', 'surveyManagement', 'bedCoordination',
        'admissionTracking', 'notifications', 'bedRequests'
      ],
      hospital: [
        'dashboard', 'bedDashboard', 'notifications', 'treatmentTracker',
        'medicalReports', 'bedDemandPrediction', 'patientRegistration', 'medicalRecords'
      ]
    };

    return permissions[userRole].includes(feature);
  };

  // Translation function
  const t = (key: string, params?: any): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value === 'string') {
      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => params[paramKey] || match);
      }
      return value;
    }
    
    return key; // Return key if translation not found
  };

  const value: AppContextType = {
    // State
    patients,
    medicalRecords,
    beds,
    bedRequests,
    visits,
    notifications,
    treatmentTrackers,
    anganwadis,
    workers,
    surveys,
    missedVisitTickets,
    visitTickets,
    aiPredictions,
    
    // User state
    currentUser,
    userRole,
    language,
    
    // Actions
    addPatient,
    updatePatient,
    addMedicalRecord,
    getPatientMedicalHistory,
    updateBed,
    addBedRequest,
    updateBedRequest,
    addVisit,
    updateVisit,
    markNotificationRead,
    addNotification,
    addTreatmentTracker,
    updateTreatmentTracker,
    addAnganwadi,
    updateAnganwadi,
    addWorker,
    updateWorker,
    addSurvey,
    addMissedVisitTicket,
    updateMissedVisitTicket,
    addVisitTicket,
    updateVisitTicket,
    addAIPrediction,
    
    // User actions
    setCurrentUser,
    logout,
    setLanguage,
    hasAccess,
    t
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};