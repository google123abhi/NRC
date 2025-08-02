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
  // State - All data comes from server, no local storage
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

  // API Base URL - Fixed to use correct environment variable
  const API_BASE_URL = 'http://localhost:3001/api';

  // API Helper function - Sends data to Node server, which handles database
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
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

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error; // Re-throw to handle in calling function
    }
  };

  // Load data from server on mount and when user role changes
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data from server...');
        
        // Load patients from server
        const patientsData = await apiCall('/patients');
        if (patientsData) {
          setPatients(patientsData);
          console.log('Patients loaded:', patientsData.length);
        }

        // Load beds from server
        const bedsData = await apiCall('/beds');
        if (bedsData) {
          setBeds(bedsData);
          console.log('Beds loaded:', bedsData.length);
        }

        // Load anganwadis from server
        const anganwadisData = await apiCall('/anganwadis');
        if (anganwadisData) {
          setAnganwadis(anganwadisData);
          console.log('Anganwadis loaded:', anganwadisData.length);
        }

        // Load workers from server
        const workersData = await apiCall('/workers');
        if (workersData) {
          setWorkers(workersData);
          console.log('Workers loaded:', workersData.length);
        }

        // Load bed requests from server
        const bedRequestsData = await apiCall('/bed-requests');
        if (bedRequestsData) {
          setBedRequests(bedRequestsData);
          console.log('Bed requests loaded:', bedRequestsData.length);
        }

        // Load notifications for current user role
        if (userRole) {
          const notificationsData = await apiCall(`/notifications/role/${userRole}`);
          if (notificationsData) {
            setNotifications(notificationsData);
            console.log('Notifications loaded:', notificationsData.length);
          }
        }

        // Load visits from server
        const visitsData = await apiCall('/visits');
        if (visitsData) {
          setVisits(visitsData);
          console.log('Visits loaded:', visitsData.length);
        }

        console.log('All data loaded successfully from server');
      } catch (error) {
        console.error('Failed to load data from server:', error);
        // Don't use fallback data - force user to fix connection
      }
    };

    loadData();
  }, [userRole]);

  // Actions - All data operations go through Node server to database
  const addPatient = async (patient: Omit<Patient, 'id'>) => {
    try {
      console.log('Sending patient data to server:', patient);
      const response = await apiCall('/patients', {
        method: 'POST',
        body: JSON.stringify(patient),
      });

      if (response) {
        console.log('Patient created successfully:', response);
        // Reload patients from server to get updated data
        const updatedPatients = await apiCall('/patients');
        setPatients(updatedPatients);
      }
    } catch (error) {
      console.error('Failed to add patient:', error);
      throw error;
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      console.log('Updating patient on server:', id, updates);
      const response = await apiCall(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('Patient updated successfully:', response);
        // Reload patients from server
        const updatedPatients = await apiCall('/patients');
        setPatients(updatedPatients);
      }
    } catch (error) {
      console.error('Failed to update patient:', error);
      throw error;
    }
  };

  const addMedicalRecord = async (record: Omit<MedicalRecord, 'id'>) => {
    try {
      console.log('Sending medical record to server:', record);
      const response = await apiCall('/medical-records', {
        method: 'POST',
        body: JSON.stringify(record),
      });

      if (response) {
        console.log('Medical record created successfully:', response);
        // Reload medical records from server
        const updatedRecords = await apiCall(`/medical-records/patient/${record.patientId}`);
        setMedicalRecords(prev => [
          ...prev.filter(r => r.patientId !== record.patientId),
          ...updatedRecords
        ]);
      }
    } catch (error) {
      console.error('Failed to add medical record:', error);
      throw error;
    }
  };

  const getPatientMedicalHistory = (patientId: string): MedicalRecord[] => {
    return medicalRecords.filter(record => record.patientId === patientId);
  };

  const updateBed = async (id: string, updates: Partial<Bed>) => {
    try {
      console.log('Updating bed on server:', id, updates);
      const response = await apiCall(`/beds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('Bed updated successfully:', response);
        // Reload beds from server
        const updatedBeds = await apiCall('/beds');
        setBeds(updatedBeds);
      }
    } catch (error) {
      console.error('Failed to update bed:', error);
      throw error;
    }
  };

  const addBedRequest = async (request: Omit<BedRequest, 'id'>) => {
    try {
      console.log('Sending bed request to server:', request);
      const response = await apiCall('/bed-requests', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (response) {
        console.log('Bed request created successfully:', response);
        // Reload bed requests from server
        const updatedRequests = await apiCall('/bed-requests');
        setBedRequests(updatedRequests);
      }
    } catch (error) {
      console.error('Failed to add bed request:', error);
      throw error;
    }
  };

  const updateBedRequest = async (id: string, updates: Partial<BedRequest>) => {
    try {
      console.log('Updating bed request on server:', id, updates);
      const response = await apiCall(`/bed-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('Bed request updated successfully:', response);
        // Reload bed requests from server
        const updatedRequests = await apiCall('/bed-requests');
        setBedRequests(updatedRequests);
      }
    } catch (error) {
      console.error('Failed to update bed request:', error);
      throw error;
    }
  };

  const addVisit = async (visit: Omit<Visit, 'id'>) => {
    try {
      console.log('Sending visit to server:', visit);
      const response = await apiCall('/visits', {
        method: 'POST',
        body: JSON.stringify(visit),
      });

      if (response) {
        console.log('Visit created successfully:', response);
        // Reload visits from server
        const updatedVisits = await apiCall('/visits');
        setVisits(updatedVisits);
      }
    } catch (error) {
      console.error('Failed to add visit:', error);
      throw error;
    }
  };

  const updateVisit = async (id: string, updates: Partial<Visit>) => {
    try {
      console.log('Updating visit on server:', id, updates);
      const response = await apiCall(`/visits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('Visit updated successfully:', response);
        // Reload visits from server
        const updatedVisits = await apiCall('/visits');
        setVisits(updatedVisits);
      }
    } catch (error) {
      console.error('Failed to update visit:', error);
      throw error;
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      console.log('Marking notification as read on server:', id);
      const response = await apiCall(`/notifications/${id}/read`, {
        method: 'PUT',
      });

      if (response) {
        console.log('Notification marked as read:', response);
        // Update local state immediately for better UX
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id'>) => {
    try {
      console.log('Sending notification to server:', notification);
      const response = await apiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify(notification),
      });

      if (response) {
        console.log('Notification created successfully:', response);
        // Reload notifications from server
        if (userRole) {
          const updatedNotifications = await apiCall(`/notifications/role/${userRole}`);
          setNotifications(updatedNotifications);
        }
      }
    } catch (error) {
      console.error('Failed to add notification:', error);
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
      console.log('Sending anganwadi to server:', anganwadi);
      const response = await apiCall('/anganwadis', {
        method: 'POST',
        body: JSON.stringify(anganwadi),
      });

      if (response) {
        console.log('Anganwadi created successfully:', response);
        // Reload anganwadis from server
        const updatedAnganwadis = await apiCall('/anganwadis');
        setAnganwadis(updatedAnganwadis);
      }
    } catch (error) {
      console.error('Failed to add anganwadi:', error);
      throw error;
    }
  };

  const updateAnganwadi = async (id: string, updates: Partial<Anganwadi>) => {
    try {
      console.log('Updating anganwadi on server:', id, updates);
      const response = await apiCall(`/anganwadis/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('Anganwadi updated successfully:', response);
        // Reload anganwadis from server
        const updatedAnganwadis = await apiCall('/anganwadis');
        setAnganwadis(updatedAnganwadis);
      }
    } catch (error) {
      console.error('Failed to update anganwadi:', error);
      throw error;
    }
  };

  const addWorker = async (worker: Omit<Worker, 'id'>) => {
    try {
      console.log('Sending worker to server:', worker);
      const response = await apiCall('/workers', {
        method: 'POST',
        body: JSON.stringify(worker),
      });

      if (response) {
        console.log('Worker created successfully:', response);
        // Reload workers from server
        const updatedWorkers = await apiCall('/workers');
        setWorkers(updatedWorkers);
      }
    } catch (error) {
      console.error('Failed to add worker:', error);
      throw error;
    }
  };

  const updateWorker = async (id: string, updates: Partial<Worker>) => {
    try {
      console.log('Updating worker on server:', id, updates);
      const response = await apiCall(`/workers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response) {
        console.log('Worker updated successfully:', response);
        // Reload workers from server
        const updatedWorkers = await apiCall('/workers');
        setWorkers(updatedWorkers);
      }
    } catch (error) {
      console.error('Failed to update worker:', error);
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