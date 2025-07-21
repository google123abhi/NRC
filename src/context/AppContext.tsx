import React, { createContext, useContext, useState, ReactNode } from 'react';

// Enhanced interfaces for the NRC Management System
export interface Patient {
  id: string;
  name: string;
  aadhaarNumber: string;
  age: number;
  type: 'child' | 'pregnant';
  pregnancyWeek?: number;
  medicalHistory: string[];
  nutritionStatus: 'normal' | 'malnourished' | 'severely_malnourished';
  registrationDate: string;
  contactNumber: string;
  address: string;
  weight: number;
  height: number;
  bloodPressure?: string;
  temperature?: number;
  symptoms: string[];
  documents: string[];
  photos: string[];
  remarks: string;
  registeredBy: string;
  lastVisit?: string;
  nextVisit: string;
  bedId?: string;
  admissionDate?: string;
  dischargeDate?: string;
  riskScore?: number;
  nutritionalDeficiency?: string[];
  registrationNumber: string;
  emergencyContact: string;
  hemoglobin?: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  visitType: 'routine' | 'follow_up' | 'emergency' | 'admission' | 'discharge';
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
  nutritionAssessment: {
    appetite: 'poor' | 'moderate' | 'good';
    foodIntake: 'inadequate' | 'adequate' | 'excessive';
    supplements: string[];
    dietPlan?: string;
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
  labResults?: {
    hemoglobin?: number;
    bloodSugar?: number;
    proteinLevel?: number;
  };
  notes: string;
  nextVisitDate?: string;
  followUpRequired: boolean;
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

export interface Bed {
  id: string;
  number: string;
  ward: string;
  status: 'available' | 'occupied' | 'maintenance';
  patientId?: string;
  admissionDate?: string;
}

export interface Notification {
  id: string;
  userId: string;
  userRole: string;
  type: 'admission_status' | 'bed_approval' | 'supervisor_instruction' | 'high_risk_alert' | 'bed_request' | 'discharge_tracking';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
  relatedId?: string;
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
  coverageAreas: string[];
  establishedDate: string;
  isActive: boolean;
  facilities: string[];
}

export interface Worker {
  id: string;
  name: string;
  employeeId: string;
  role: 'head' | 'supervisor' | 'helper' | 'asha';
  anganwadiId: string;
  contactNumber: string;
  address: string;
  joinDate: string;
  isActive: boolean;
  qualifications: string[];
  assignedAreas: string[];
  workingHours: {
    start: string;
    end: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    contactNumber: string;
  };
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
  missedReason?: {
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
    otherDescription?: string;
  };
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
  supervisorComments?: string;
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
    contactMethod: 'home_visit' | 'phone_call' | 'community_contact';
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
}

export interface SurveyReport {
  id: string;
  patientId: string;
  date: string;
  healthWorkerId: string;
  observations: string;
  nutritionData: {
    appetite: 'poor' | 'moderate' | 'good';
    foodIntake: 'inadequate' | 'adequate' | 'excessive';
    supplements: string[];
  };
  symptoms: string[];
  recommendations: string[];
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
    endDate?: string;
  }[];
  doctorRemarks: string[];
  dailyProgress: {
    date: string;
    weight: number;
    appetite: 'poor' | 'moderate' | 'good';
    notes: string;
  }[];
  labReports: {
    date: string;
    type: string;
    results: string;
  }[];
  dischargeSummary?: {
    finalWeight: number;
    healthImprovement: string;
    followUpInstructions: string[];
    nextCheckupDate: string;
  };
}

interface AppContextType {
  // State
  patients: Patient[];
  medicalRecords: MedicalRecord[];
  visits: Visit[];
  bedRequests: BedRequest[];
  beds: Bed[];
  notifications: Notification[];
  anganwadis: Anganwadi[];
  workers: Worker[];
  visitTickets: AnganwadiVisitTicket[];
  missedVisitTickets: MissedVisitTicket[];
  surveys: SurveyReport[];
  aiPredictions: HealthPrediction[];
  treatmentTrackers: TreatmentTracker[];
  
  // User management
  language: 'en' | 'hi';
  currentUser: any;
  userRole: 'anganwadi_worker' | 'supervisor' | 'hospital' | null;
  
  // Functions
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => void;
  getPatientMedicalHistory: (patientId: string) => MedicalRecord[];
  addVisit: (visit: Omit<Visit, 'id'>) => void;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  addBedRequest: (request: Omit<BedRequest, 'id'>) => void;
  updateBedRequest: (id: string, updates: Partial<BedRequest>) => void;
  updateBed: (id: string, updates: Partial<Bed>) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  addVisitTicket: (ticket: Omit<AnganwadiVisitTicket, 'id'>) => void;
  updateVisitTicket: (id: string, updates: Partial<AnganwadiVisitTicket>) => void;
  addMissedVisitTicket: (ticket: Omit<MissedVisitTicket, 'id'>) => void;
  updateMissedVisitTicket: (id: string, updates: Partial<MissedVisitTicket>) => void;
  addSurvey: (survey: Omit<SurveyReport, 'id'>) => void;
  addAIPrediction: (prediction: Omit<HealthPrediction, 'id'>) => void;
  addTreatmentTracker: (tracker: Omit<TreatmentTracker, 'id'>) => void;
  updateTreatmentTracker: (id: string, updates: Partial<TreatmentTracker>) => void;
  
  setLanguage: (lang: 'en' | 'hi') => void;
  setCurrentUser: (user: any, role: 'anganwadi_worker' | 'supervisor' | 'hospital') => void;
  logout: () => void;
  hasAccess: (section: string) => boolean;
  t: (key: string, params?: Record<string, any>) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.patientRegistration': 'Patient Registration',
    'nav.medicalRecords': 'Medical Records',
    'nav.visitScheduling': 'Visit Scheduling',
    'nav.bedAvailability': 'Bed Availability',
    'nav.notifications': 'Notifications',
    'nav.aiPrediction': 'AI Health Prediction',
    'nav.postHospitalization': 'Post-Hospitalization Tracker',
    'nav.centerManagement': 'Center Management',
    'nav.workerManagement': 'Worker Management',
    'nav.visitTicketing': 'Visit Ticketing',
    'nav.surveyManagement': 'Survey Management',
    'nav.bedCoordination': 'Bed Coordination',
    'nav.admissionTracking': 'Admission/Discharge Tracking',
    'nav.bedRequests': 'Bed Requests',
    'nav.bedDashboard': 'Bed Dashboard',
    'nav.treatmentTracker': 'Treatment Tracker',
    'nav.medicalReports': 'Medical Reports',
    'nav.bedDemandPrediction': 'Bed Demand Prediction',

    // System
    'system.title': 'NRC Management System',
    'system.subtitle': 'Nutrition Rehabilitation Center',

    // Common
    'common.name': 'Name',
    'common.age': 'Age',
    'common.years': 'years',
    'common.yearsOld': 'years old',
    'common.contact': 'Contact',
    'common.address': 'Address',
    'common.weight': 'Weight',
    'common.height': 'Height',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.notes': 'Notes',
    'common.actions': 'Actions',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.update': 'Update',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.filter': 'Filter',
    'common.search': 'Search',
    'common.all': 'All',
    'common.pending': 'Pending',
    'common.approved': 'Approved',
    'common.declined': 'Declined',
    'common.scheduled': 'Scheduled',
    'common.completed': 'Completed',
    'common.missed': 'Missed',
    'common.cancelled': 'Cancelled',
    'common.inProgress': 'In Progress',
    'common.high': 'High',
    'common.medium': 'Medium',
    'common.low': 'Low',
    'common.critical': 'Critical',
    'common.required': 'Required',
    'common.other': 'Other',
    'common.commaSeparated': 'comma separated',

    // Patient
    'patient.patient': 'Patient',
    'patient.patients': 'Patients',
    'patient.registration': 'Patient Registration',
    'patient.selectPatient': 'Select Patient',
    'patient.child': 'Child',
    'patient.children': 'Children',
    'patient.pregnant': 'Pregnant Woman',
    'patient.pregnantWomen': 'Pregnant Women',
    'patient.pregnancyWeek': 'Pregnancy Week',
    'patient.weeks': 'weeks',
    'patient.nutritionStatus': 'Nutrition Status',
    'patient.normal': 'Normal',
    'patient.malnourished': 'Malnourished',
    'patient.severelyMalnourished': 'Severely Malnourished',
    'patient.medicalHistory': 'Medical History',
    'patient.bloodPressure': 'Blood Pressure',
    'patient.hemoglobin': 'Hemoglobin',
    'patient.nextVisit': 'Next Visit',
    'patient.admissionDate': 'Admission Date',
    'patient.basicInfo': 'Basic Information',
    'patient.healthInfo': 'Health Information',
    'patient.visitInfo': 'Visit Information',
    'patient.add': 'Add Patient',
    'patient.edit': 'Edit Patient',
    'patient.allTypes': 'All Types',
    'patient.allStatuses': 'All Statuses',
    'patient.searchPlaceholder': 'Search by name or contact...',
    'patient.type': 'Type',

    // Medical
    'medical.records': 'Medical Records',
    'medical.addRecord': 'Add Medical Record',
    'medical.addMedical': 'Add Medical Record',
    'medical.visitType': 'Visit Type',
    'medical.routine': 'Routine',
    'medical.followUp': 'Follow Up',
    'medical.emergency': 'Emergency',
    'medical.admission': 'Admission',
    'medical.discharge': 'Discharge',
    'medical.vitalSigns': 'Vital Signs',
    'medical.temperature': 'Temperature',
    'medical.temp': 'Temp',
    'medical.bp': 'BP',
    'medical.symptoms': 'Symptoms',
    'medical.diagnosis': 'Diagnosis',
    'medical.medications': 'Medications',
    'medical.medicationsFormat': 'Medications (Name|Dosage|Frequency|Duration per line)',
    'medical.medicationsPlaceholder': 'Iron tablets|100mg|Once daily|30 days\nVitamin D|400IU|Daily|60 days',
    'medical.nutritionAssessment': 'Nutrition Assessment',
    'medical.labResults': 'Lab Results',
    'medical.hb': 'Hb',
    'medical.sugar': 'Sugar',
    'medical.protein': 'Protein',
    'medical.clinicalNotes': 'Clinical Notes',
    'medical.followUpRequired': 'Follow-up Required',
    'medical.nextVisitDate': 'Next Visit Date',
    'medical.saveRecord': 'Save Record',
    'medical.recordDetails': 'Record Details',
    'medical.selectPatient': 'Select Patient',
    'medical.choosePatient': 'Choose Patient',
    'medical.completeHistory': 'Complete medical history and records',
    'medical.registration': 'Registration',
    'medical.currentWeight': 'Current Weight',
    'medical.totalRecords': 'Total Records',
    'medical.noRecords': 'No medical records found for this patient',
    'medical.keyFindings': 'Key Findings',
    'medical.followUpStatus': 'Follow-up Status',
    'medical.more': 'more',
    'medical.vitals': 'Vitals',

    // Visit
    'visit.scheduling': 'Visit Scheduling',
    'visit.schedule': 'Schedule Visit',
    'visit.scheduleNew': 'Schedule New Visit',
    'visit.scheduledDate': 'Scheduled Date',
    'visit.scheduledTime': 'Scheduled Time',
    'visit.healthWorkerId': 'Health Worker ID',
    'visit.selectDate': 'Select Date',
    'visit.statusFilter': 'Status Filter',
    'visit.allStatuses': 'All Statuses',
    'visit.scheduled': 'Scheduled',
    'visit.completed': 'Completed',
    'visit.missed': 'Missed',
    'visit.visitsFor': 'Visits for {{date}}',
    'visit.noVisits': 'No visits scheduled for this date',
    'visit.healthWorker': 'Health Worker',
    'visit.completedOn': 'Completed on {{date}}',
    'visit.markComplete': 'Mark Complete',
    'visit.markMissed': 'Mark Missed',
    'visit.reschedule': 'Reschedule',
    'visit.viewTicket': 'View Ticket',
    'visit.missedVisitsAlert': 'Missed Visits Alert',
    'visit.missedVisitsCount': '{{count}} missed visits require attention',
    'visit.nextAttempt': 'Next attempt: {{date}}',

    // Bed
    'bed.availability': 'Bed Availability',
    'bed.request': 'Bed Request',
    'bed.urgencyLevel': 'Urgency Level',
    'bed.medicalJustification': 'Medical Justification',
    'bed.estimatedStay': 'Estimated Stay (days)',
    'bed.specialRequirements': 'Special Requirements',
    'bed.available': 'Available',
    'bed.occupied': 'Occupied',
    'bed.maintenance': 'Maintenance',
    'bed.management': 'Bed Management',
    'bed.lowAvailability': 'Low Bed Availability',
    'bed.approve': 'Approve',
    'bed.decline': 'Decline',
    'bed.referToHospital': 'Refer to Hospital',
    'bed.requestApproval': 'Bed Request Approval',
    'bed.reviewComments': 'Review Comments',
    'bed.hospitalReferral': 'Hospital Referral',
    'bed.hospitalName': 'Hospital Name',
    'bed.referralReason': 'Referral Reason',

    // Urgency
    'urgency.low': 'Low',
    'urgency.medium': 'Medium',
    'urgency.high': 'High',
    'urgency.critical': 'Critical',
    'urgency.routine': 'Routine',
    'urgency.urgent': 'Urgent',
    'urgency.emergency': 'Emergency',

    // Notification
    'notification.admissionStatus': 'Admission Status',
    'notification.bedApproval': 'Bed Approval',
    'notification.supervisorInstruction': 'Supervisor Instruction',
    'notification.highRiskAlert': 'High Risk Alert',
    'notification.bedRequest': 'Bed Request',
    'notification.dischargeTracking': 'Discharge Tracking',

    // AI
    'ai.healthPrediction': 'AI Health Prediction',
    'ai.poweredInsights': 'AI-powered health insights and predictions',
    'ai.generateNew': 'Generate New Prediction',
    'ai.selectPatient': 'Select Patient for Analysis',
    'ai.analyzing': 'Analyzing...',
    'ai.generatePrediction': 'Generate Prediction',
    'ai.quickRecovery': 'Quick Recovery',
    'ai.lessThanEqual30': '≤ 30 days',
    'ai.moderateRecovery': 'Moderate Recovery',
    'ai.between31And60': '31-60 days',
    'ai.extendedRecovery': 'Extended Recovery',
    'ai.greaterThan60': '> 60 days',
    'ai.noPredictions': 'No AI predictions generated yet',
    'ai.selectPatientFirst': 'Select a patient to generate health predictions',
    'ai.recoveryPrediction': 'Recovery Prediction',
    'ai.estimatedRecoveryTime': 'Estimated Recovery Time',
    'ai.days': 'days',
    'ai.confidenceLevel': 'Confidence Level',
    'ai.riskFactors': 'Risk Factors',
    'ai.recommendations': 'Recommendations',
    'ai.generated': 'AI Generated',

    // Anganwadi
    'anganwadi.management': 'Anganwadi Management',
    'anganwadi.centers': 'Anganwadi Centers',

    // Worker
    'worker.management': 'Worker Management',
    'worker.head': 'Head',
    'worker.supervisor': 'Supervisor',
    'worker.helper': 'Helper',
    'worker.asha': 'ASHA Worker',

    // Ticket
    'ticket.visitTickets': 'Visit Tickets',
    'ticket.createTicket': 'Create Ticket',
    'ticket.anganwadi': 'Select Anganwadi',
    'ticket.worker': 'Select Worker',
    'ticket.assignedArea': 'Select Assigned Area',
    'ticket.visitType': 'Visit Type',
    'ticket.routineCheckup': 'Routine Checkup',
    'ticket.nutritionSurvey': 'Nutrition Survey',
    'ticket.vaccination': 'Vaccination',
    'ticket.emergency': 'Emergency',
    'ticket.followUp': 'Follow Up',
    'ticket.targetBeneficiaries': 'Target Beneficiaries',
    'ticket.pregnantWomen': 'Pregnant Women',
    'ticket.children': 'Children',
    'ticket.missedReasons': 'Missed Reasons',
    'ticket.completionDetails': 'Completion Details',
    'ticket.actualStartTime': 'Actual Start Time',
    'ticket.actualEndTime': 'Actual End Time',
    'ticket.beneficiariesCovered': 'Beneficiaries Covered',
    'ticket.activitiesCompleted': 'Activities Completed',
    'ticket.issuesEncountered': 'Issues Encountered',
    'ticket.nextVisitDate': 'Next Visit Date',
    'ticket.escalationLevel': 'Escalation Level',
    'ticket.importantNote': 'Important Note',
    'ticket.aiDisclaimer': 'AI predictions are for guidance only. Always consult with medical professionals for treatment decisions.',
    'ticket.notRequired': 'Not Required',

    // Survey
    'survey.reports': 'Survey Reports',
    'survey.submit': 'Submit Report',
    'survey.submitReport': 'Submit Survey Report',
    'survey.observations': 'Observations',
    'survey.observationsPlaceholder': 'Detailed observations about patient condition...',
    'survey.appetite': 'Appetite',
    'survey.poor': 'Poor',
    'survey.moderate': 'Moderate',
    'survey.good': 'Good',
    'survey.foodIntake': 'Food Intake',
    'survey.inadequate': 'Inadequate',
    'survey.adequate': 'Adequate',
    'survey.excessive': 'Excessive',
    'survey.supplements': 'Supplements',
    'survey.supplementsPlaceholder': 'Iron tablets, Vitamin D, Calcium',
    'survey.symptoms': 'Symptoms',
    'survey.symptomsPlaceholder': 'Weakness, Loss of appetite, Fatigue',
    'survey.recommendationsPlaceholder': 'Increase protein intake, Regular monitoring, Medical consultation',
    'survey.searchReports': 'Search reports...',
    'survey.allPatients': 'All Patients',
    'survey.noReports': 'No survey reports found',
    'survey.medicalObservations': 'Medical Observations',
    'survey.nutritionAssessment': 'Nutrition Assessment',
    'survey.symptomsObserved': 'Symptoms Observed',
  },
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.patientRegistration': 'रोगी पंजीकरण',
    'nav.medicalRecords': 'चिकित्सा रिकॉर्ड',
    'nav.visitScheduling': 'विज़िट शेड्यूलिंग',
    'nav.bedAvailability': 'बिस्तर उपलब्धता',
    'nav.notifications': 'सूचनाएं',
    'nav.aiPrediction': 'एआई स्वास्थ्य भविष्यवाणी',
    'nav.postHospitalization': 'अस्पताल के बाद ट्रैकर',
    'nav.centerManagement': 'केंद्र प्रबंधन',
    'nav.workerManagement': 'कार्यकर्ता प्रबंधन',
    'nav.visitTicketing': 'विज़िट टिकटिंग',
    'nav.surveyManagement': 'सर्वेक्षण प्रबंधन',
    'nav.bedCoordination': 'बिस्तर समन्वय',
    'nav.admissionTracking': 'प्रवेश/छुट्टी ट्रैकिंग',
    'nav.bedRequests': 'बिस्तर अनुरोध',
    'nav.bedDashboard': 'बिस्तर डैशबोर्ड',
    'nav.treatmentTracker': 'उपचार ट्रैकर',
    'nav.medicalReports': 'चिकित्सा रिपोर्ट',
    'nav.bedDemandPrediction': 'बिस्तर मांग भविष्यवाणी',

    // System
    'system.title': 'एनआरसी प्रबंधन प्रणाली',
    'system.subtitle': 'पोषण पुनर्वास केंद्र',

    // Common
    'common.name': 'नाम',
    'common.age': 'उम्र',
    'common.years': 'वर्ष',
    'common.yearsOld': 'वर्ष की उम्र',
    'common.contact': 'संपर्क',
    'common.address': 'पता',
    'common.weight': 'वजन',
    'common.height': 'ऊंचाई',
    'common.status': 'स्थिति',
    'common.date': 'दिनांक',
    'common.time': 'समय',
    'common.notes': 'नोट्स',
    'common.actions': 'कार्य',
    'common.cancel': 'रद्द करें',
    'common.submit': 'जमा करें',
    'common.save': 'सेव करें',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.update': 'अपडेट करें',
    'common.delete': 'हटाएं',
    'common.add': 'जोड़ें',
    'common.filter': 'फिल्टर',
    'common.search': 'खोजें',
    'common.all': 'सभी',
    'common.pending': 'लंबित',
    'common.approved': 'स्वीकृत',
    'common.declined': 'अस्वीकृत',
    'common.scheduled': 'निर्धारित',
    'common.completed': 'पूर्ण',
    'common.missed': 'छूटा हुआ',
    'common.cancelled': 'रद्द',
    'common.inProgress': 'प्रगति में',
    'common.high': 'उच्च',
    'common.medium': 'मध्यम',
    'common.low': 'कम',
    'common.critical': 'गंभीर',
    'common.required': 'आवश्यक',
    'common.other': 'अन्य',
    'common.commaSeparated': 'अल्पविराम से अलग',

    // Patient
    'patient.patient': 'रोगी',
    'patient.patients': 'रोगी',
    'patient.registration': 'रोगी पंजीकरण',
    'patient.selectPatient': 'रोगी चुनें',
    'patient.child': 'बच्चा',
    'patient.children': 'बच्चे',
    'patient.pregnant': 'गर्भवती महिला',
    'patient.pregnantWomen': 'गर्भवती महिलाएं',
    'patient.pregnancyWeek': 'गर्भावस्था सप्ताह',
    'patient.weeks': 'सप्ताह',
    'patient.nutritionStatus': 'पोषण स्थिति',
    'patient.normal': 'सामान्य',
    'patient.malnourished': 'कुपोषित',
    'patient.severelyMalnourished': 'गंभीर कुपोषित',
    'patient.medicalHistory': 'चिकित्सा इतिहास',
    'patient.bloodPressure': 'रक्तचाप',
    'patient.hemoglobin': 'हीमोग्लोबिन',
    'patient.nextVisit': 'अगली विज़िट',
    'patient.admissionDate': 'प्रवेश दिनांक',
    'patient.basicInfo': 'बुनियादी जानकारी',
    'patient.healthInfo': 'स्वास्थ्य जानकारी',
    'patient.visitInfo': 'विज़िट जानकारी',
    'patient.add': 'रोगी जोड़ें',
    'patient.edit': 'रोगी संपादित करें',
    'patient.allTypes': 'सभी प्रकार',
    'patient.allStatuses': 'सभी स्थितियां',
    'patient.searchPlaceholder': 'नाम या संपर्क से खोजें...',
    'patient.type': 'प्रकार',

    // Medical
    'medical.records': 'चिकित्सा रिकॉर्ड',
    'medical.addRecord': 'चिकित्सा रिकॉर्ड जोड़ें',
    'medical.addMedical': 'चिकित्सा रिकॉर्ड जोड़ें',
    'medical.visitType': 'विज़िट प्रकार',
    'medical.routine': 'नियमित',
    'medical.followUp': 'फॉलो अप',
    'medical.emergency': 'आपातकाल',
    'medical.admission': 'प्रवेश',
    'medical.discharge': 'छुट्टी',
    'medical.vitalSigns': 'महत्वपूर्ण संकेत',
    'medical.temperature': 'तापमान',
    'medical.temp': 'तापमान',
    'medical.bp': 'रक्तचाप',
    'medical.symptoms': 'लक्षण',
    'medical.diagnosis': 'निदान',
    'medical.medications': 'दवाएं',
    'medical.medicationsFormat': 'दवाएं (नाम|खुराक|आवृत्ति|अवधि प्रति पंक्ति)',
    'medical.medicationsPlaceholder': 'आयरन टैबलेट|100mg|दिन में एक बार|30 दिन\nविटामिन डी|400IU|दैनिक|60 दिन',
    'medical.nutritionAssessment': 'पोषण मूल्यांकन',
    'medical.labResults': 'लैब परिणाम',
    'medical.hb': 'हीमोग्लोबिन',
    'medical.sugar': 'शुगर',
    'medical.protein': 'प्रोटीन',
    'medical.clinicalNotes': 'क्लिनिकल नोट्स',
    'medical.followUpRequired': 'फॉलो-अप आवश्यक',
    'medical.nextVisitDate': 'अगली विज़िट की तारीख',
    'medical.saveRecord': 'रिकॉर्ड सेव करें',
    'medical.recordDetails': 'रिकॉर्ड विवरण',
    'medical.selectPatient': 'रोगी चुनें',
    'medical.choosePatient': 'रोगी चुनें',
    'medical.completeHistory': 'पूर्ण चिकित्सा इतिहास और रिकॉर्ड',
    'medical.registration': 'पंजीकरण',
    'medical.currentWeight': 'वर्तमान वजन',
    'medical.totalRecords': 'कुल रिकॉर्ड',
    'medical.noRecords': 'इस रोगी के लिए कोई चिकित्सा रिकॉर्ड नहीं मिला',
    'medical.keyFindings': 'मुख्य निष्कर्ष',
    'medical.followUpStatus': 'फॉलो-अप स्थिति',
    'medical.more': 'और',
    'medical.vitals': 'महत्वपूर्ण संकेत',

    // Visit
    'visit.scheduling': 'विज़िट शेड्यूलिंग',
    'visit.schedule': 'विज़िट शेड्यूल करें',
    'visit.scheduleNew': 'नई विज़िट शेड्यूल करें',
    'visit.scheduledDate': 'निर्धारित दिनांक',
    'visit.scheduledTime': 'निर्धारित समय',
    'visit.healthWorkerId': 'स्वास्थ्य कार्यकर्ता आईडी',
    'visit.selectDate': 'दिनांक चुनें',
    'visit.statusFilter': 'स्थिति फिल्टर',
    'visit.allStatuses': 'सभी स्थितियां',
    'visit.scheduled': 'निर्धारित',
    'visit.completed': 'पूर्ण',
    'visit.missed': 'छूटा हुआ',
    'visit.visitsFor': '{{date}} के लिए विज़िट',
    'visit.noVisits': 'इस दिनांक के लिए कोई विज़िट निर्धारित नहीं',
    'visit.healthWorker': 'स्वास्थ्य कार्यकर्ता',
    'visit.completedOn': '{{date}} को पूर्ण',
    'visit.markComplete': 'पूर्ण चिह्नित करें',
    'visit.markMissed': 'छूटा हुआ चिह्नित करें',
    'visit.reschedule': 'पुनर्निर्धारण',
    'visit.viewTicket': 'टिकट देखें',
    'visit.missedVisitsAlert': 'छूटी हुई विज़िट अलर्ट',
    'visit.missedVisitsCount': '{{count}} छूटी हुई विज़िट पर ध्यान देने की आवश्यकता',
    'visit.nextAttempt': 'अगला प्रयास: {{date}}',

    // Bed
    'bed.availability': 'बिस्तर उपलब्धता',
    'bed.request': 'बिस्तर अनुरोध',
    'bed.urgencyLevel': 'तात्कालिकता स्तर',
    'bed.medicalJustification': 'चिकित्सा औचित्य',
    'bed.estimatedStay': 'अनुमानित रहने की अवधि (दिन)',
    'bed.specialRequirements': 'विशेष आवश्यकताएं',
    'bed.available': 'उपलब्ध',
    'bed.occupied': 'कब्जे में',
    'bed.maintenance': 'रखरखाव',
    'bed.management': 'बिस्तर प्रबंधन',
    'bed.lowAvailability': 'कम बिस्तर उपलब्धता',
    'bed.approve': 'स्वीकृत करें',
    'bed.decline': 'अस्वीकार करें',
    'bed.referToHospital': 'अस्पताल में रेफर करें',
    'bed.requestApproval': 'बिस्तर अनुरोध अनुमोदन',
    'bed.reviewComments': 'समीक्षा टिप्पणी',
    'bed.hospitalReferral': 'अस्पताल रेफरल',
    'bed.hospitalName': 'अस्पताल का नाम',
    'bed.referralReason': 'रेफरल कारण',

    // Urgency
    'urgency.low': 'कम',
    'urgency.medium': 'मध्यम',
    'urgency.high': 'उच्च',
    'urgency.critical': 'गंभीर',
    'urgency.routine': 'नियमित',
    'urgency.urgent': 'तत्काल',
    'urgency.emergency': 'आपातकाल',

    // Notification
    'notification.admissionStatus': 'प्रवेश स्थिति',
    'notification.bedApproval': 'बिस्तर अनुमोदन',
    'notification.supervisorInstruction': 'पर्यवेक्षक निर्देश',
    'notification.highRiskAlert': 'उच्च जोखिम अलर्ट',
    'notification.bedRequest': 'बिस्तर अनुरोध',
    'notification.dischargeTracking': 'छुट्टी ट्रैकिंग',

    // AI
    'ai.healthPrediction': 'एआई स्वास्थ्य भविष्यवाणी',
    'ai.poweredInsights': 'एआई-संचालित स्वास्थ्य अंतर्दृष्टि और भविष्यवाणियां',
    'ai.generateNew': 'नई भविष्यवाणी उत्पन्न करें',
    'ai.selectPatient': 'विश्लेषण के लिए रोगी चुनें',
    'ai.analyzing': 'विश्लेषण कर रहे हैं...',
    'ai.generatePrediction': 'भविष्यवाणी उत्पन्न करें',
    'ai.quickRecovery': 'त्वरित रिकवरी',
    'ai.lessThanEqual30': '≤ 30 दिन',
    'ai.moderateRecovery': 'मध्यम रिकवरी',
    'ai.between31And60': '31-60 दिन',
    'ai.extendedRecovery': 'विस्तारित रिकवरी',
    'ai.greaterThan60': '> 60 दिन',
    'ai.noPredictions': 'अभी तक कोई एआई भविष्यवाणी उत्पन्न नहीं हुई',
    'ai.selectPatientFirst': 'स्वास्थ्य भविष्यवाणी उत्पन्न करने के लिए एक रोगी चुनें',
    'ai.recoveryPrediction': 'रिकवरी भविष्यवाणी',
    'ai.estimatedRecoveryTime': 'अनुमानित रिकवरी समय',
    'ai.days': 'दिन',
    'ai.confidenceLevel': 'विश्वास स्तर',
    'ai.riskFactors': 'जोखिम कारक',
    'ai.recommendations': 'सिफारिशें',
    'ai.generated': 'एआई उत्पन्न',

    // Anganwadi
    'anganwadi.management': 'आंगनवाड़ी प्रबंधन',
    'anganwadi.centers': 'आंगनवाड़ी केंद्र',

    // Worker
    'worker.management': 'कार्यकर्ता प्रबंधन',
    'worker.head': 'प्रमुख',
    'worker.supervisor': 'पर्यवेक्षक',
    'worker.helper': 'सहायक',
    'worker.asha': 'आशा कार्यकर्ता',

    // Ticket
    'ticket.visitTickets': 'विज़िट टिकट',
    'ticket.createTicket': 'टिकट बनाएं',
    'ticket.anganwadi': 'आंगनवाड़ी चुनें',
    'ticket.worker': 'कार्यकर्ता चुनें',
    'ticket.assignedArea': 'निर्दिष्ट क्षेत्र चुनें',
    'ticket.visitType': 'विज़िट प्रकार',
    'ticket.routineCheckup': 'नियमित जांच',
    'ticket.nutritionSurvey': 'पोषण सर्वेक्षण',
    'ticket.vaccination': 'टीकाकरण',
    'ticket.emergency': 'आपातकाल',
    'ticket.followUp': 'फॉलो अप',
    'ticket.targetBeneficiaries': 'लक्षित लाभार्थी',
    'ticket.pregnantWomen': 'गर्भवती महिलाएं',
    'ticket.children': 'बच्चे',
    'ticket.missedReasons': 'छूटने के कारण',
    'ticket.completionDetails': 'पूर्णता विवरण',
    'ticket.actualStartTime': 'वास्तविक प्रारंभ समय',
    'ticket.actualEndTime': 'वास्तविक समाप्ति समय',
    'ticket.beneficiariesCovered': 'कवर किए गए लाभार्थी',
    'ticket.activitiesCompleted': 'पूर्ण की गई गतिविधियां',
    'ticket.issuesEncountered': 'आई समस्याएं',
    'ticket.nextVisitDate': 'अगली विज़िट की तारीख',
    'ticket.escalationLevel': 'एस्केलेशन स्तर',
    'ticket.importantNote': 'महत्वपूर्ण नोट',
    'ticket.aiDisclaimer': 'एआई भविष्यवाणियां केवल मार्गदर्शन के लिए हैं। उपचार निर्णयों के लिए हमेशा चिकित्सा पेशेवरों से सलाह लें।',
    'ticket.notRequired': 'आवश्यक नहीं',

    // Survey
    'survey.reports': 'सर्वेक्षण रिपोर्ट',
    'survey.submit': 'रिपोर्ट जमा करें',
    'survey.submitReport': 'सर्वेक्षण रिपोर्ट जमा करें',
    'survey.observations': 'अवलोकन',
    'survey.observationsPlaceholder': 'रोगी की स्थिति के बारे में विस्तृत अवलोकन...',
    'survey.appetite': 'भूख',
    'survey.poor': 'खराब',
    'survey.moderate': 'मध्यम',
    'survey.good': 'अच्छी',
    'survey.foodIntake': 'भोजन सेवन',
    'survey.inadequate': 'अपर्याप्त',
    'survey.adequate': 'पर्याप्त',
    'survey.excessive': 'अत्यधिक',
    'survey.supplements': 'पूरक आहार',
    'survey.supplementsPlaceholder': 'आयरन टैबलेट, विटामिन डी, कैल्शियम',
    'survey.symptoms': 'लक्षण',
    'survey.symptomsPlaceholder': 'कमजोरी, भूख न लगना, थकान',
    'survey.recommendationsPlaceholder': 'प्रोटीन सेवन बढ़ाएं, नियमित निगरानी, चिकित्सा परामर्श',
    'survey.searchReports': 'रिपोर्ट खोजें...',
    'survey.allPatients': 'सभी रोगी',
    'survey.noReports': 'कोई सर्वेक्षण रिपोर्ट नहीं मिली',
    'survey.medicalObservations': 'चिकित्सा अवलोकन',
    'survey.nutritionAssessment': 'पोषण मूल्यांकन',
    'survey.symptomsObserved': 'देखे गए लक्षण',
  }
};

// Enhanced Mock Data with complete relationships
const mockPatients: Patient[] = [
  {
    id: 'PAT001',
    name: 'Aarav Kumar',
    aadhaarNumber: '1234-5678-9012',
    age: 3,
    type: 'child',
    medicalHistory: ['Anemia', 'Respiratory infections'],
    nutritionStatus: 'severely_malnourished',
    registrationDate: '2024-01-15',
    contactNumber: '+91 9876543230',
    address: 'Village Khatauli, Meerut, UP',
    weight: 8.5,
    height: 85,
    bloodPressure: '90/60',
    temperature: 99.2,
    symptoms: ['Weakness', 'Loss of appetite', 'Frequent infections'],
    documents: ['Aadhaar Card', 'Birth Certificate'],
    photos: ['patient_photo_1.jpg', 'growth_chart.jpg'],
    remarks: 'Severe malnutrition detected during community screening. Immediate intervention required.',
    registeredBy: 'EMP001',
    nextVisit: '2024-01-22',
    riskScore: 85,
    nutritionalDeficiency: ['Protein', 'Iron', 'Vitamin D'],
    registrationNumber: 'NRC001',
    emergencyContact: '+91 9876543231',
    hemoglobin: 8.2
  },
  {
    id: 'PAT002',
    name: 'Priya Devi',
    aadhaarNumber: '2345-6789-0123',
    age: 24,
    type: 'pregnant',
    pregnancyWeek: 28,
    medicalHistory: ['Hypertension', 'Iron deficiency'],
    nutritionStatus: 'malnourished',
    registrationDate: '2024-01-20',
    contactNumber: '+91 9876543231',
    address: 'Mohalla Islamabad, Meerut, UP',
    weight: 52,
    height: 155,
    bloodPressure: '140/90',
    temperature: 98.6,
    symptoms: ['Fatigue', 'Swelling in legs', 'Shortness of breath'],
    documents: ['Aadhaar Card', 'Pregnancy Card'],
    photos: ['patient_photo_2.jpg', 'ultrasound.jpg'],
    remarks: 'Pregnant woman with malnutrition and hypertension. Regular monitoring required.',
    registeredBy: 'EMP002',
    nextVisit: '2024-01-25',
    riskScore: 70,
    nutritionalDeficiency: ['Iron', 'Folic Acid', 'Calcium'],
    registrationNumber: 'NRC002',
    emergencyContact: '+91 9876543232',
    hemoglobin: 9.5
  },
  {
    id: 'PAT003',
    name: 'Ravi Singh',
    aadhaarNumber: '3456-7890-1234',
    age: 2,
    type: 'child',
    medicalHistory: ['Diarrhea', 'Malnutrition'],
    nutritionStatus: 'severely_malnourished',
    registrationDate: '2024-01-10',
    contactNumber: '+91 9876543232',
    address: 'Ganga Nagar, Meerut, UP',
    weight: 7.2,
    height: 78,
    bloodPressure: '85/55',
    temperature: 100.1,
    symptoms: ['Severe weakness', 'Dehydration', 'Poor appetite'],
    documents: ['Aadhaar Card', 'Birth Certificate'],
    photos: ['patient_photo_3.jpg'],
    remarks: 'Critical case requiring immediate hospitalization.',
    registeredBy: 'EMP001',
    nextVisit: '2024-01-18',
    riskScore: 95,
    nutritionalDeficiency: ['Protein', 'Iron', 'Vitamin D', 'Zinc'],
    registrationNumber: 'NRC003',
    emergencyContact: '+91 9876543233',
    hemoglobin: 7.8,
    bedId: 'BED_002',
    admissionDate: '2024-01-10'
  }
];

const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'MED001',
    patientId: 'PAT001',
    date: '2024-01-15',
    visitType: 'routine',
    healthWorkerId: 'EMP001',
    vitals: {
      weight: 8.5,
      height: 85,
      temperature: 99.2,
      bloodPressure: '90/60',
      pulse: 110,
      respiratoryRate: 28
    },
    nutritionAssessment: {
      appetite: 'poor',
      foodIntake: 'inadequate',
      supplements: ['Iron tablets', 'Vitamin D drops'],
      dietPlan: 'High protein, high calorie diet with frequent small meals'
    },
    symptoms: ['Weakness', 'Loss of appetite'],
    diagnosis: ['Severe Acute Malnutrition', 'Iron deficiency anemia'],
    treatment: ['Therapeutic feeding', 'Iron supplementation'],
    medications: [
      {
        name: 'Iron tablets',
        dosage: '100mg',
        frequency: 'Once daily',
        duration: '30 days'
      }
    ],
    labResults: {
      hemoglobin: 8.2,
      proteinLevel: 5.5
    },
    notes: 'Child shows signs of severe malnutrition. Started on therapeutic feeding program.',
    followUpRequired: true,
    nextVisitDate: '2024-01-22'
  },
  {
    id: 'MED002',
    patientId: 'PAT002',
    date: '2024-01-20',
    visitType: 'routine',
    healthWorkerId: 'EMP002',
    vitals: {
      weight: 52,
      height: 155,
      temperature: 98.6,
      bloodPressure: '140/90',
      pulse: 88
    },
    nutritionAssessment: {
      appetite: 'moderate',
      foodIntake: 'adequate',
      supplements: ['Iron tablets', 'Folic acid', 'Calcium'],
      dietPlan: 'Balanced diet with increased protein and iron-rich foods'
    },
    symptoms: ['Fatigue', 'Swelling in legs'],
    diagnosis: ['Pregnancy-induced hypertension', 'Iron deficiency anemia'],
    treatment: ['Blood pressure monitoring', 'Iron supplementation', 'Rest'],
    medications: [
      {
        name: 'Iron tablets',
        dosage: '200mg',
        frequency: 'Twice daily',
        duration: '60 days'
      },
      {
        name: 'Folic acid',
        dosage: '5mg',
        frequency: 'Once daily',
        duration: '60 days'
      }
    ],
    labResults: {
      hemoglobin: 9.5,
      bloodSugar: 95
    },
    notes: 'Pregnant woman with controlled hypertension. Continue monitoring.',
    followUpRequired: true,
    nextVisitDate: '2024-01-27'
  }
];

const mockVisits: Visit[] = [
  {
    id: 'VIS001',
    patientId: 'PAT001',
    healthWorkerId: 'EMP001',
    scheduledDate: '2024-01-22',
    status: 'scheduled',
    notes: 'Follow-up visit to check weight gain and appetite improvement'
  },
  {
    id: 'VIS002',
    patientId: 'PAT002',
    healthWorkerId: 'EMP002',
    scheduledDate: '2024-01-25',
    status: 'scheduled',
    notes: 'Monitor blood pressure and pregnancy progress'
  },
  {
    id: 'VIS003',
    patientId: 'PAT001',
    healthWorkerId: 'EMP001',
    scheduledDate: '2024-01-20',
    actualDate: '2024-01-20',
    status: 'completed',
    notes: 'Initial assessment completed. Started treatment plan.'
  }
];

const mockBedRequests: BedRequest[] = [
  {
    id: 'BED001',
    patientId: 'PAT001',
    requestedBy: 'EMP001',
    requestDate: '2024-01-15',
    urgencyLevel: 'high',
    medicalJustification: 'Severe acute malnutrition requiring immediate medical intervention and therapeutic feeding',
    currentCondition: 'Child is severely underweight with signs of kwashiorkor. Requires immediate hospitalization.',
    estimatedStayDuration: 21,
    specialRequirements: 'Pediatric ward with therapeutic feeding facilities',
    status: 'pending'
  },
  {
    id: 'BED002',
    patientId: 'PAT003',
    requestedBy: 'EMP001',
    requestDate: '2024-01-10',
    urgencyLevel: 'critical',
    medicalJustification: 'Critical malnutrition with dehydration requiring immediate hospitalization',
    currentCondition: 'Child is in critical condition with severe dehydration and malnutrition.',
    estimatedStayDuration: 28,
    status: 'approved',
    reviewedBy: 'SUP001',
    reviewDate: '2024-01-10',
    reviewComments: 'Approved for immediate admission. Bed P-002 assigned.'
  }
];

const mockBeds: Bed[] = [
  {
    id: 'BED_001',
    number: 'P-001',
    ward: 'Pediatric',
    status: 'available'
  },
  {
    id: 'BED_002',
    number: 'P-002',
    ward: 'Pediatric',
    status: 'occupied',
    patientId: 'PAT003',
    admissionDate: '2024-01-10'
  },
  {
    id: 'BED_003',
    number: 'M-001',
    ward: 'Maternity',
    status: 'available'
  },
  {
    id: 'BED_004',
    number: 'M-002',
    ward: 'Maternity',
    status: 'maintenance'
  },
  {
    id: 'BED_005',
    number: 'P-003',
    ward: 'Pediatric',
    status: 'available'
  }
];

const mockNotifications: Notification[] = [
  {
    id: 'NOT001',
    userId: 'EMP001',
    userRole: 'anganwadi_worker',
    type: 'bed_approval',
    title: 'Bed Request Approved',
    message: 'Your bed request for Aarav Kumar has been approved. Bed P-001 assigned.',
    date: '2024-01-16',
    read: false,
    priority: 'high',
    actionRequired: true,
    relatedId: 'BED001'
  },
  {
    id: 'NOT002',
    userId: 'SUP001',
    userRole: 'supervisor',
    type: 'high_risk_alert',
    title: 'High Risk Patient Alert',
    message: 'Patient Aarav Kumar has a risk score of 85. Immediate attention required.',
    date: '2024-01-15',
    read: false,
    priority: 'critical',
    actionRequired: true,
    relatedId: 'PAT001'
  },
  {
    id: 'NOT003',
    userId: 'HOSP001',
    userRole: 'hospital',
    type: 'bed_request',
    title: 'New Bed Request',
    message: 'New bed request received for critical patient Ravi Singh.',
    date: '2024-01-10',
    read: true,
    priority: 'critical',
    actionRequired: false,
    relatedId: 'BED002'
  }
];

const mockAnganwadis: Anganwadi[] = [
  {
    id: 'AWC001',
    name: 'Anganwadi Center Meerut-1',
    code: 'MRT001',
    location: {
      area: 'Sadar Bazaar',
      district: 'Meerut',
      state: 'Uttar Pradesh',
      pincode: '250001',
      coordinates: { latitude: 28.9845, longitude: 77.7064 }
    },
    supervisor: {
      name: 'Dr. Sunita Devi',
      contactNumber: '+91 9876543210',
      employeeId: 'SUP001'
    },
    capacity: { pregnantWomen: 25, children: 40 },
    coverageAreas: ['Sadar Bazaar', 'Civil Lines', 'Shastri Nagar'],
    establishedDate: '2015-04-15',
    isActive: true,
    facilities: ['Nutrition Kitchen', 'Medical Room', 'Play Area', 'Counseling Room']
  },
  {
    id: 'AWC002',
    name: 'Anganwadi Center Meerut-2',
    code: 'MRT002',
    location: {
      area: 'Ganga Nagar',
      district: 'Meerut',
      state: 'Uttar Pradesh',
      pincode: '250002',
      coordinates: { latitude: 28.9745, longitude: 77.7164 }
    },
    supervisor: {
      name: 'Mrs. Kavita Sharma',
      contactNumber: '+91 9876543211',
      employeeId: 'SUP002'
    },
    capacity: { pregnantWomen: 30, children: 50 },
    coverageAreas: ['Ganga Nagar', 'Brahmpuri', 'Lalkurti'],
    establishedDate: '2016-06-20',
    isActive: true,
    facilities: ['Nutrition Kitchen', 'Medical Room', 'Play Area', 'Computer Room']
  }
];

const mockWorkers: Worker[] = [
  {
    id: 'WRK001',
    name: 'Priya Sharma',
    employeeId: 'EMP001',
    role: 'helper',
    anganwadiId: 'AWC001',
    contactNumber: '+91 9876543220',
    address: 'House No. 123, Sadar Bazaar, Meerut',
    joinDate: '2018-01-15',
    isActive: true,
    qualifications: ['B.A.', 'Anganwadi Training Certificate'],
    assignedAreas: ['Sadar Bazaar', 'Civil Lines'],
    workingHours: { start: '09:00', end: '17:00' },
    emergencyContact: {
      name: 'Raj Sharma',
      relation: 'Husband',
      contactNumber: '+91 9876543221'
    }
  },
  {
    id: 'WRK002',
    name: 'Meera Devi',
    employeeId: 'EMP002',
    role: 'asha',
    anganwadiId: 'AWC001',
    contactNumber: '+91 9876543222',
    address: 'House No. 456, Shastri Nagar, Meerut',
    joinDate: '2019-03-10',
    isActive: true,
    qualifications: ['12th Pass', 'ASHA Training Certificate'],
    assignedAreas: ['Shastri Nagar'],
    workingHours: { start: '08:00', end: '16:00' },
    emergencyContact: {
      name: 'Ram Devi',
      relation: 'Mother-in-law',
      contactNumber: '+91 9876543223'
    }
  },
  {
    id: 'WRK003',
    name: 'Dr. Sunita Devi',
    employeeId: 'SUP001',
    role: 'supervisor',
    anganwadiId: 'AWC001',
    contactNumber: '+91 9876543210',
    address: 'Medical Colony, Meerut',
    joinDate: '2015-01-01',
    isActive: true,
    qualifications: ['MBBS', 'Public Health Diploma'],
    assignedAreas: ['Sadar Bazaar', 'Civil Lines', 'Shastri Nagar'],
    workingHours: { start: '08:00', end: '18:00' },
    emergencyContact: {
      name: 'Dr. Rajesh Devi',
      relation: 'Husband',
      contactNumber: '+91 9876543224'
    }
  }
];

const mockVisitTickets: AnganwadiVisitTicket[] = [
  {
    id: 'VT001',
    anganwadiId: 'AWC001',
    workerId: 'WRK001',
    scheduledDate: '2024-01-25',
    scheduledTime: '10:00',
    assignedArea: 'Sadar Bazaar',
    visitType: 'routine_checkup',
    targetBeneficiaries: { pregnantWomen: 5, children: 8 },
    status: 'scheduled',
    reportedBy: 'SUP001',
    reportedDate: '2024-01-20',
    escalationLevel: 'none'
  },
  {
    id: 'VT002',
    anganwadiId: 'AWC001',
    workerId: 'WRK002',
    scheduledDate: '2024-01-22',
    scheduledTime: '14:00',
    assignedArea: 'Shastri Nagar',
    visitType: 'nutrition_survey',
    targetBeneficiaries: { pregnantWomen: 3, children: 6 },
    status: 'completed',
    reportedBy: 'SUP001',
    reportedDate: '2024-01-18',
    escalationLevel: 'none',
    completionDetails: {
      actualStartTime: '14:15',
      actualEndTime: '16:30',
      beneficiariesCovered: { pregnantWomen: 3, children: 6 },
      activitiesCompleted: ['Nutrition counseling', 'Weight measurement', 'Health education'],
      issuesEncountered: ['Some families not available'],
      followUpRequired: true,
      nextVisitDate: '2024-02-05'
    }
  }
];

const mockMissedVisitTickets: MissedVisitTicket[] = [
  {
    id: 'MVT001',
    patientId: 'PAT001',
    visitId: 'VIS001',
    dateReported: '2024-01-22',
    reportedBy: 'EMP001',
    missedConditions: {
      patientNotAvailable: true,
      patientRefused: false,
      familyNotCooperative: false,
      transportIssues: false,
      weatherConditions: false,
      patientIll: false,
      familyEmergency: false,
      workCommitments: false,
      lackOfAwareness: false,
      other: false
    },
    attemptDetails: {
      timeOfAttempt: '10:30',
      locationVisited: 'Patient home address',
      contactMethod: 'home_visit'
    },
    patientCondition: {
      currentHealthStatus: 'unknown',
      urgencyLevel: 'medium',
      visibleSymptoms: [],
      familyReportedConcerns: []
    },
    actionsTaken: ['Attempted visit', 'Left message with neighbor'],
    followUpRequired: true,
    nextAttemptDate: '2024-01-24',
    supervisorNotified: false,
    status: 'open',
    escalationLevel: 'none'
  }
];

const mockSurveys: SurveyReport[] = [
  {
    id: 'SUR001',
    patientId: 'PAT001',
    date: '2024-01-15',
    healthWorkerId: 'EMP001',
    observations: 'Child appears weak and underweight. Family reports decreased appetite and frequent illness.',
    nutritionData: {
      appetite: 'poor',
      foodIntake: 'inadequate',
      supplements: ['Iron tablets', 'Vitamin D']
    },
    symptoms: ['Weakness', 'Loss of appetite', 'Frequent infections'],
    recommendations: ['Immediate medical attention', 'Therapeutic feeding', 'Regular monitoring']
  },
  {
    id: 'SUR002',
    patientId: 'PAT002',
    date: '2024-01-20',
    healthWorkerId: 'EMP002',
    observations: 'Pregnant woman with signs of anemia and mild hypertension. Needs regular monitoring.',
    nutritionData: {
      appetite: 'moderate',
      foodIntake: 'adequate',
      supplements: ['Iron tablets', 'Folic acid', 'Calcium']
    },
    symptoms: ['Fatigue', 'Swelling in legs'],
    recommendations: ['Blood pressure monitoring', 'Iron supplementation', 'Regular checkups']
  }
];

const mockAIPredictions: HealthPrediction[] = [
  {
    id: 'AI001',
    patientId: 'PAT001',
    date: '2024-01-15',
    predictedRecoveryDays: 45,
    confidence: 0.82,
    riskFactors: ['Severe malnutrition', 'Anemia', 'Young age'],
    recommendations: ['Immediate therapeutic feeding', '24-hour medical supervision', 'Micronutrient supplementation']
  },
  {
    id: 'AI002',
    patientId: 'PAT002',
    date: '2024-01-20',
    predictedRecoveryDays: 30,
    confidence: 0.75,
    riskFactors: ['Pregnancy-induced hypertension', 'Iron deficiency'],
    recommendations: ['Regular blood pressure monitoring', 'Iron supplementation', 'Prenatal care']
  }
];

const mockTreatmentTrackers: TreatmentTracker[] = [
  {
    id: 'TT001',
    patientId: 'PAT003',
    hospitalId: 'HOSP001',
    admissionDate: '2024-01-10',
    treatmentPlan: ['Therapeutic feeding', 'IV fluid therapy', 'Antibiotic treatment'],
    medicineSchedule: [
      {
        medicine: 'Amoxicillin',
        dosage: '250mg',
        frequency: 'Twice daily',
        startDate: '2024-01-10',
        endDate: '2024-01-17'
      },
      {
        medicine: 'Iron syrup',
        dosage: '5ml',
        frequency: 'Once daily',
        startDate: '2024-01-10'
      }
    ],
    doctorRemarks: ['Patient responding well to treatment', 'Continue current medication'],
    dailyProgress: [
      {
        date: '2024-01-10',
        weight: 7.2,
        appetite: 'poor',
        notes: 'Initial admission. Child very weak, started on IV fluids.'
      },
      {
        date: '2024-01-11',
        weight: 7.3,
        appetite: 'poor',
        notes: 'Slight improvement in hydration. Continue treatment.'
      },
      {
        date: '2024-01-12',
        weight: 7.4,
        appetite: 'moderate',
        notes: 'Appetite improving. Started taking oral feeds.'
      }
    ],
    labReports: [
      {
        date: '2024-01-10',
        type: 'Blood Test',
        results: 'Hb: 7.8 g/dL, WBC: 12,000, Protein: 4.2 g/dL'
      },
      {
        date: '2024-01-12',
        type: 'Follow-up Blood Test',
        results: 'Hb: 8.1 g/dL, WBC: 10,500, Protein: 4.8 g/dL'
      }
    ]
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'anganwadi_worker' | 'supervisor' | 'hospital' | null>(null);
  
  // State
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(mockMedicalRecords);
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [bedRequests, setBedRequests] = useState<BedRequest[]>(mockBedRequests);
  const [beds, setBeds] = useState<Bed[]>(mockBeds);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [anganwadis, setAnganwadis] = useState<Anganwadi[]>(mockAnganwadis);
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers);
  const [visitTickets, setVisitTickets] = useState<AnganwadiVisitTicket[]>(mockVisitTickets);
  const [missedVisitTickets, setMissedVisitTickets] = useState<MissedVisitTicket[]>(mockMissedVisitTickets);
  const [surveys, setSurveys] = useState<SurveyReport[]>(mockSurveys);
  const [aiPredictions, setAIPredictions] = useState<HealthPrediction[]>(mockAIPredictions);
  const [treatmentTrackers, setTreatmentTrackers] = useState<TreatmentTracker[]>(mockTreatmentTrackers);

  const setCurrentUserWithRole = (user: any, role: 'anganwadi_worker' | 'supervisor' | 'hospital') => {
    setCurrentUser(user);
    setUserRole(role);
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
  };

  const hasAccess = (section: string): boolean => {
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
    
    return permissions[userRole]?.includes(section) || false;
  };

  const t = (key: string, params?: Record<string, any>): string => {
    let translation = translations[language][key as keyof typeof translations['en']] || key;
    
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param].toString());
      });
    }
    
    return translation;
  };

  // CRUD Functions
  const addPatient = (patient: Omit<Patient, 'id'>) => {
    const newPatient: Patient = { ...patient, id: `PAT${Date.now()}` };
    setPatients(prev => [...prev, newPatient]);
    
    // Auto-generate notification for high-risk patients
    if (newPatient.riskScore && newPatient.riskScore > 80) {
      addNotification({
        userId: newPatient.registeredBy,
        userRole: 'anganwadi_worker',
        type: 'high_risk_alert',
        title: 'High Risk Patient Registered',
        message: `Patient ${newPatient.name} has a high risk score of ${newPatient.riskScore}. Immediate attention required.`,
        date: new Date().toISOString().split('T')[0],
        read: false,
        priority: 'critical',
        actionRequired: true,
        relatedId: newPatient.id
      });
    }
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(patient => 
      patient.id === id ? { ...patient, ...updates } : patient
    ));
  };

  const addMedicalRecord = (record: Omit<MedicalRecord, 'id'>) => {
    const newRecord: MedicalRecord = { ...record, id: `MED${Date.now()}` };
    setMedicalRecords(prev => [...prev, newRecord]);
    
    // Update patient's last visit
    updatePatient(record.patientId, { lastVisit: record.date });
  };

  const getPatientMedicalHistory = (patientId: string): MedicalRecord[] => {
    return medicalRecords.filter(record => record.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const addVisit = (visit: Omit<Visit, 'id'>) => {
    const newVisit: Visit = { ...visit, id: `VIS${Date.now()}` };
    setVisits(prev => [...prev, newVisit]);
  };

  const updateVisit = (id: string, updates: Partial<Visit>) => {
    setVisits(prev => prev.map(visit => 
      visit.id === id ? { ...visit, ...updates } : visit
    ));
  };

  const addBedRequest = (request: Omit<BedRequest, 'id'>) => {
    const newRequest: BedRequest = { ...request, id: `BED${Date.now()}` };
    setBedRequests(prev => [...prev, newRequest]);
    
    // Notify supervisor about new bed request
    addNotification({
      userId: 'SUP001',
      userRole: 'supervisor',
      type: 'bed_request',
      title: 'New Bed Request',
      message: `New ${request.urgencyLevel} priority bed request received for patient.`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      priority: request.urgencyLevel === 'critical' ? 'critical' : 'high',
      actionRequired: true,
      relatedId: newRequest.id
    });
  };

  const updateBedRequest = (id: string, updates: Partial<BedRequest>) => {
    setBedRequests(prev => prev.map(request => 
      request.id === id ? { ...request, ...updates } : request
    ));
    
    // Notify requester about status change
    const request = bedRequests.find(r => r.id === id);
    if (request && updates.status) {
      addNotification({
        userId: request.requestedBy,
        userRole: 'anganwadi_worker',
        type: 'bed_approval',
        title: `Bed Request ${updates.status}`,
        message: `Your bed request has been ${updates.status}. ${updates.reviewComments || ''}`,
        date: new Date().toISOString().split('T')[0],
        read: false,
        priority: updates.status === 'approved' ? 'high' : 'medium',
        actionRequired: updates.status === 'approved',
        relatedId: id
      });
    }
  };

  const updateBed = (id: string, updates: Partial<Bed>) => {
    setBeds(prev => prev.map(bed => 
      bed.id === id ? { ...bed, ...updates } : bed
    ));
    
    // Update patient bed assignment
    if (updates.patientId) {
      updatePatient(updates.patientId, { bedId: id, admissionDate: updates.admissionDate });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = { ...notification, id: `NOT${Date.now()}` };
    setNotifications(prev => [...prev, newNotification]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const addVisitTicket = (ticket: Omit<AnganwadiVisitTicket, 'id'>) => {
    const newTicket: AnganwadiVisitTicket = { ...ticket, id: `VT${Date.now()}` };
    setVisitTickets(prev => [...prev, newTicket]);
  };

  const updateVisitTicket = (id: string, updates: Partial<AnganwadiVisitTicket>) => {
    setVisitTickets(prev => prev.map(ticket => 
      ticket.id === id ? { ...ticket, ...updates } : ticket
    ));
  };

  const addMissedVisitTicket = (ticket: Omit<MissedVisitTicket, 'id'>) => {
    const newTicket: MissedVisitTicket = { ...ticket, id: `MVT${Date.now()}` };
    setMissedVisitTickets(prev => [...prev, newTicket]);
  };

  const updateMissedVisitTicket = (id: string, updates: Partial<MissedVisitTicket>) => {
    setMissedVisitTickets(prev => prev.map(ticket => 
      ticket.id === id ? { ...ticket, ...updates } : ticket
    ));
  };

  const addSurvey = (survey: Omit<SurveyReport, 'id'>) => {
    const newSurvey: SurveyReport = { ...survey, id: `SUR${Date.now()}` };
    setSurveys(prev => [...prev, newSurvey]);
  };

  const addAIPrediction = (prediction: Omit<HealthPrediction, 'id'>) => {
    const newPrediction: HealthPrediction = { ...prediction, id: `AI${Date.now()}` };
    setAIPredictions(prev => [...prev, newPrediction]);
  };

  const addTreatmentTracker = (tracker: Omit<TreatmentTracker, 'id'>) => {
    const newTracker: TreatmentTracker = { ...tracker, id: `TT${Date.now()}` };
    setTreatmentTrackers(prev => [...prev, newTracker]);
  };

  const updateTreatmentTracker = (id: string, updates: Partial<TreatmentTracker>) => {
    setTreatmentTrackers(prev => prev.map(tracker => 
      tracker.id === id ? { ...tracker, ...updates } : tracker
    ));
    
    // Update patient discharge status if discharged
    if (updates.dischargeDate) {
      const tracker = treatmentTrackers.find(t => t.id === id);
      if (tracker) {
        updatePatient(tracker.patientId, { 
          dischargeDate: updates.dischargeDate,
          bedId: undefined 
        });
        
        // Free up the bed
        const patient = patients.find(p => p.id === tracker.patientId);
        if (patient?.bedId) {
          updateBed(patient.bedId, { 
            status: 'available', 
            patientId: undefined, 
            admissionDate: undefined 
          });
        }
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        // State
        patients,
        medicalRecords,
        visits,
        bedRequests,
        beds,
        notifications,
        anganwadis,
        workers,
        visitTickets,
        missedVisitTickets,
        surveys,
        aiPredictions,
        treatmentTrackers,
        
        // User management
        language,
        currentUser,
        userRole,
        
        // Functions
        addPatient,
        updatePatient,
        addMedicalRecord,
        getPatientMedicalHistory,
        addVisit,
        updateVisit,
        addBedRequest,
        updateBedRequest,
        updateBed,
        addNotification,
        markNotificationRead,
        addVisitTicket,
        updateVisitTicket,
        addMissedVisitTicket,
        updateMissedVisitTicket,
        addSurvey,
        addAIPrediction,
        addTreatmentTracker,
        updateTreatmentTracker,
        
        setLanguage,
        setCurrentUser: setCurrentUserWithRole,
        logout,
        hasAccess,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};