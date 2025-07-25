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
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => void;
  getPatientMedicalHistory: (patientId: string) => MedicalRecord[];
  updateBed: (id: string, updates: Partial<Bed>) => void;
  addBedRequest: (request: Omit<BedRequest, 'id'>) => void;
  updateBedRequest: (id: string, updates: Partial<BedRequest>) => void;
  addVisit: (visit: Omit<Visit, 'id'>) => void;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  addTreatmentTracker: (tracker: Omit<TreatmentTracker, 'id'>) => void;
  updateTreatmentTracker: (id: string, updates: Partial<TreatmentTracker>) => void;
  addAnganwadi: (anganwadi: Omit<Anganwadi, 'id'>) => void;
  updateAnganwadi: (id: string, updates: Partial<Anganwadi>) => void;
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
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

// Mock data
const mockPatients: Patient[] = [
  {
    id: '1',
    registrationNumber: 'NRC001',
    aadhaarNumber: '1234-5678-9012',
    name: 'Aarav Kumar',
    age: 3,
    type: 'child',
    contactNumber: '+91 9876543210',
    address: 'Sadar Bazaar, Meerut, UP',
    weight: 8.5,
    height: 85,
    bloodPressure: '90/60',
    temperature: 98.6,
    hemoglobin: 8.2,
    nutritionStatus: 'severely_malnourished',
    medicalHistory: ['Anemia', 'Frequent infections'],
    symptoms: ['Weakness', 'Loss of appetite', 'Frequent crying'],
    documents: ['Aadhaar Card', 'Birth Certificate'],
    photos: ['patient_photo.jpg'],
    remarks: 'Requires immediate attention and therapeutic feeding',
    riskScore: 85,
    nutritionalDeficiency: ['Protein', 'Iron', 'Vitamin D'],
    registeredBy: 'EMP001',
    registrationDate: '2024-01-15',
    admissionDate: '2024-01-15',
    nextVisit: '2024-01-22'
  },
  {
    id: '2',
    registrationNumber: 'NRC002',
    aadhaarNumber: '2345-6789-0123',
    name: 'Priya Devi',
    age: 24,
    type: 'pregnant',
    pregnancyWeek: 28,
    contactNumber: '+91 9876543211',
    address: 'Civil Lines, Meerut, UP',
    weight: 45,
    height: 155,
    bloodPressure: '110/70',
    temperature: 98.4,
    hemoglobin: 9.1,
    nutritionStatus: 'malnourished',
    medicalHistory: ['Anemia'],
    symptoms: ['Fatigue', 'Dizziness'],
    documents: ['Aadhaar Card', 'Pregnancy Card'],
    photos: ['patient_photo2.jpg'],
    remarks: 'Regular monitoring required',
    riskScore: 65,
    nutritionalDeficiency: ['Iron', 'Folic Acid'],
    registeredBy: 'EMP001',
    registrationDate: '2024-01-16',
    admissionDate: '2024-01-16',
    nextVisit: '2024-01-23'
  }
];

const mockAnganwadis: Anganwadi[] = [
  {
    id: 'awc-001',
    name: 'Anganwadi Center Sadar',
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
      name: 'Sunita Devi',
      contactNumber: '+91 9876543210',
      employeeId: 'SUP001'
    },
    capacity: {
      pregnantWomen: 25,
      children: 50
    },
    facilities: ['Kitchen', 'Playground', 'Medical Room', 'Toilet'],
    coverageAreas: ['Sadar Bazaar', 'Civil Lines', 'Shastri Nagar'],
    establishedDate: '2020-01-15',
    isActive: true
  },
  {
    id: 'awc-002',
    name: 'Anganwadi Center Cantonment',
    code: 'AWC002',
    location: {
      area: 'Cantonment Area',
      district: 'Meerut',
      state: 'Uttar Pradesh',
      pincode: '250004',
      coordinates: {
        latitude: 28.9845,
        longitude: 77.7064
      }
    },
    supervisor: {
      name: 'Rajesh Kumar',
      contactNumber: '+91 9876543211',
      employeeId: 'SUP002'
    },
    capacity: {
      pregnantWomen: 20,
      children: 40
    },
    facilities: ['Kitchen', 'Medical Room', 'Toilet'],
    coverageAreas: ['Cantonment', 'Mall Road'],
    establishedDate: '2019-03-20',
    isActive: true
  }
];

const mockWorkers: Worker[] = [
  {
    id: 'worker-001',
    employeeId: 'EMP001',
    name: 'Priya Sharma',
    role: 'head',
    anganwadiId: 'awc-001',
    contactNumber: '+91 9876543210',
    address: 'Sadar Bazaar, Meerut',
    assignedAreas: ['Sadar Bazaar', 'Civil Lines'],
    qualifications: ['ANM Certification', 'Child Care Training'],
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    emergencyContact: {
      name: 'Raj Sharma',
      relation: 'Husband',
      contactNumber: '+91 9876543220'
    },
    joinDate: '2020-02-01',
    isActive: true
  },
  {
    id: 'worker-002',
    employeeId: 'EMP002',
    name: 'Meera Devi',
    role: 'helper',
    anganwadiId: 'awc-001',
    contactNumber: '+91 9876543211',
    address: 'Shastri Nagar, Meerut',
    assignedAreas: ['Shastri Nagar'],
    qualifications: ['Basic Health Training'],
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    emergencyContact: {
      name: 'Ram Devi',
      relation: 'Mother',
      contactNumber: '+91 9876543221'
    },
    joinDate: '2020-03-15',
    isActive: true
  },
  {
    id: 'worker-003',
    employeeId: 'EMP003',
    name: 'Kavita Singh',
    role: 'asha',
    anganwadiId: 'awc-002',
    contactNumber: '+91 9876543212',
    address: 'Cantonment, Meerut',
    assignedAreas: ['Cantonment', 'Mall Road'],
    qualifications: ['ASHA Training', 'Community Health'],
    workingHours: {
      start: '08:00',
      end: '16:00'
    },
    emergencyContact: {
      name: 'Suresh Singh',
      relation: 'Husband',
      contactNumber: '+91 9876543222'
    },
    joinDate: '2019-06-10',
    isActive: true
  }
];

const mockBeds: Bed[] = [
  { id: 'bed-001', hospitalId: 'hosp-001', number: 'B001', ward: 'Pediatric', status: 'available' },
  { id: 'bed-002', hospitalId: 'hosp-001', number: 'B002', ward: 'Pediatric', status: 'available' },
  { id: 'bed-003', hospitalId: 'hosp-001', number: 'M001', ward: 'Maternity', status: 'available' },
  { id: 'bed-004', hospitalId: 'hosp-001', number: 'M002', ward: 'Maternity', status: 'occupied', patientId: '2', admissionDate: '2024-01-16' }
];

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userRole: 'supervisor',
    type: 'high_risk_alert',
    title: 'High Risk Patient Alert',
    message: 'New severely malnourished child Aarav Kumar registered with risk score 85%',
    priority: 'high',
    actionRequired: true,
    read: false,
    date: '2024-01-15'
  },
  {
    id: 'notif-002',
    userRole: 'hospital',
    type: 'bed_request',
    title: 'New Bed Request',
    message: 'Bed request for Priya Devi - Maternity ward required',
    priority: 'medium',
    actionRequired: true,
    read: false,
    date: '2024-01-16'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [beds, setBeds] = useState<Bed[]>(mockBeds);
  const [bedRequests, setBedRequests] = useState<BedRequest[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [treatmentTrackers, setTreatmentTrackers] = useState<TreatmentTracker[]>([]);
  const [anganwadis, setAnganwadis] = useState<Anganwadi[]>(mockAnganwadis);
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers);
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

  // API Helper function
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      // Return mock data or handle gracefully
      return null;
    }
  };

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load patients
        const patientsData = await apiCall('/patients');
        if (patientsData) setPatients(patientsData);

        // Load beds
        const bedsData = await apiCall('/beds');
        if (bedsData) setBeds(bedsData);

        // Load anganwadis
        const anganwadisData = await apiCall('/anganwadis');
        if (anganwadisData) setAnganwadis(anganwadisData);

        // Load workers
        const workersData = await apiCall('/workers');
        if (workersData) setWorkers(workersData);

        // Load notifications for current user role
        if (userRole) {
          const notificationsData = await apiCall(`/notifications/role/${userRole}`);
          if (notificationsData) setNotifications(notificationsData);
        }
      } catch (error) {
        console.error('Failed to load data from API:', error);
      }
    };

    loadData();
  }, [userRole]);

  // Actions
  const addPatient = async (patient: Omit<Patient, 'id'>) => {
    try {
      const newPatient = await apiCall('/patients', {
        method: 'POST',
        body: JSON.stringify(patient),
      });

      if (newPatient) {
        setPatients(prev => [...prev, newPatient]);
      } else {
        // Fallback to local state
        const id = Date.now().toString();
        setPatients(prev => [...prev, { ...patient, id }]);
      }
    } catch (error) {
      console.error('Failed to add patient:', error);
      // Fallback to local state
      const id = Date.now().toString();
      setPatients(prev => [...prev, { ...patient, id }]);
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const updatedPatient = await apiCall(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (updatedPatient) {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      } else {
        // Fallback to local state
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      }
    } catch (error) {
      console.error('Failed to update patient:', error);
      // Fallback to local state
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const addMedicalRecord = async (record: Omit<MedicalRecord, 'id'>) => {
    try {
      const newRecord = await apiCall('/medical-records', {
        method: 'POST',
        body: JSON.stringify(record),
      });

      if (newRecord) {
        setMedicalRecords(prev => [...prev, newRecord]);
      } else {
        // Fallback to local state
        const id = Date.now().toString();
        setMedicalRecords(prev => [...prev, { ...record, id }]);
      }
    } catch (error) {
      console.error('Failed to add medical record:', error);
      // Fallback to local state
      const id = Date.now().toString();
      setMedicalRecords(prev => [...prev, { ...record, id }]);
    }
  };

  const getPatientMedicalHistory = (patientId: string): MedicalRecord[] => {
    return medicalRecords.filter(record => record.patientId === patientId);
  };

  const updateBed = async (id: string, updates: Partial<Bed>) => {
    try {
      const updatedBed = await apiCall(`/beds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (updatedBed) {
        setBeds(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      } else {
        // Fallback to local state
        setBeds(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      }
    } catch (error) {
      console.error('Failed to update bed:', error);
      // Fallback to local state
      setBeds(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    }
  };

  const addBedRequest = async (request: Omit<BedRequest, 'id'>) => {
    try {
      const newRequest = await apiCall('/bed-requests', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (newRequest) {
        setBedRequests(prev => [...prev, newRequest]);
      } else {
        // Fallback to local state
        const id = Date.now().toString();
        setBedRequests(prev => [...prev, { ...request, id }]);
      }
    } catch (error) {
      console.error('Failed to add bed request:', error);
      // Fallback to local state
      const id = Date.now().toString();
      setBedRequests(prev => [...prev, { ...request, id }]);
    }
  };

  const updateBedRequest = async (id: string, updates: Partial<BedRequest>) => {
    try {
      const updatedRequest = await apiCall(`/bed-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (updatedRequest) {
        setBedRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      } else {
        // Fallback to local state
        setBedRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      }
    } catch (error) {
      console.error('Failed to update bed request:', error);
      // Fallback to local state
      setBedRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    }
  };

  const addVisit = async (visit: Omit<Visit, 'id'>) => {
    try {
      const newVisit = await apiCall('/visits', {
        method: 'POST',
        body: JSON.stringify(visit),
      });

      if (newVisit) {
        setVisits(prev => [...prev, newVisit]);
      } else {
        // Fallback to local state
        const id = Date.now().toString();
        setVisits(prev => [...prev, { ...visit, id }]);
      }
    } catch (error) {
      console.error('Failed to add visit:', error);
      // Fallback to local state
      const id = Date.now().toString();
      setVisits(prev => [...prev, { ...visit, id }]);
    }
  };

  const updateVisit = async (id: string, updates: Partial<Visit>) => {
    try {
      const updatedVisit = await apiCall(`/visits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (updatedVisit) {
        setVisits(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
      } else {
        // Fallback to local state
        setVisits(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
      }
    } catch (error) {
      console.error('Failed to update visit:', error);
      // Fallback to local state
      setVisits(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiCall(`/notifications/${id}/read`, {
        method: 'PUT',
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Fallback to local state
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id'>) => {
    try {
      const newNotification = await apiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify(notification),
      });

      if (newNotification) {
        setNotifications(prev => [...prev, newNotification]);
      } else {
        // Fallback to local state
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { ...notification, id }]);
      }
    } catch (error) {
      console.error('Failed to add notification:', error);
      // Fallback to local state
      const id = Date.now().toString();
      setNotifications(prev => [...prev, { ...notification, id }]);
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
      const newAnganwadi = await apiCall('/anganwadis', {
        method: 'POST',
        body: JSON.stringify(anganwadi),
      });

      if (newAnganwadi) {
        setAnganwadis(prev => [...prev, newAnganwadi]);
      } else {
        // Fallback to local state
        const id = Date.now().toString();
        setAnganwadis(prev => [...prev, { ...anganwadi, id }]);
      }
    } catch (error) {
      console.error('Failed to add anganwadi:', error);
      // Fallback to local state
      const id = Date.now().toString();
      setAnganwadis(prev => [...prev, { ...anganwadi, id }]);
    }
  };

  const updateAnganwadi = async (id: string, updates: Partial<Anganwadi>) => {
    try {
      const updatedAnganwadi = await apiCall(`/anganwadis/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (updatedAnganwadi) {
        setAnganwadis(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      } else {
        // Fallback to local state
        setAnganwadis(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      }
    } catch (error) {
      console.error('Failed to update anganwadi:', error);
      // Fallback to local state
      setAnganwadis(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }
  };

  const addWorker = async (worker: Omit<Worker, 'id'>) => {
    try {
      const newWorker = await apiCall('/workers', {
        method: 'POST',
        body: JSON.stringify(worker),
      });

      if (newWorker) {
        setWorkers(prev => [...prev, newWorker]);
      } else {
        // Fallback to local state
        const id = Date.now().toString();
        setWorkers(prev => [...prev, { ...worker, id }]);
      }
    } catch (error) {
      console.error('Failed to add worker:', error);
      // Fallback to local state
      const id = Date.now().toString();
      setWorkers(prev => [...prev, { ...worker, id }]);
    }
  };

  const updateWorker = async (id: string, updates: Partial<Worker>) => {
    try {
      const updatedWorker = await apiCall(`/workers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (updatedWorker) {
        setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
      } else {
        // Fallback to local state
        setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
      }
    } catch (error) {
      console.error('Failed to update worker:', error);
      // Fallback to local state
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
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