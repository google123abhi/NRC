import { useState, useEffect, useCallback } from 'react';
import { 
  patientsAPI, 
  medicalRecordsAPI, 
  bedsAPI, 
  visitsAPI, 
  notificationsAPI,
  workersAPI,
  anganwadisAPI 
} from '../services/api';

// Hook for patients
export const usePatients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientsAPI.getAll();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPatient = useCallback(async (patientData: any) => {
    try {
      await patientsAPI.create(patientData);
      await fetchPatients(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to create patient');
      throw err;
    }
  }, [fetchPatients]);

  const updatePatient = useCallback(async (id: string, updates: any) => {
    try {
      await patientsAPI.update(id, updates);
      await fetchPatients(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to update patient');
      throw err;
    }
  }, [fetchPatients]);

  const deletePatient = useCallback(async (id: string) => {
    try {
      await patientsAPI.delete(id);
      await fetchPatients(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to delete patient');
      throw err;
    }
  }, [fetchPatients]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
    refreshPatients: fetchPatients
  };
};

// Hook for medical records
export const useMedicalRecords = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPatientMedicalHistory = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await medicalRecordsAPI.getByPatientId(patientId);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch medical records');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createMedicalRecord = useCallback(async (recordData: any) => {
    try {
      return await medicalRecordsAPI.create(recordData);
    } catch (err: any) {
      setError(err.message || 'Failed to create medical record');
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    getPatientMedicalHistory,
    createMedicalRecord
  };
};

// Hook for beds
export const useBeds = () => {
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bedsAPI.getAll();
      setBeds(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBed = useCallback(async (id: string, updates: any) => {
    try {
      await bedsAPI.update(id, updates);
      await fetchBeds(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to update bed');
      throw err;
    }
  }, [fetchBeds]);

  useEffect(() => {
    fetchBeds();
  }, [fetchBeds]);

  return {
    beds,
    loading,
    error,
    updateBed,
    refreshBeds: fetchBeds
  };
};

// Hook for visits
export const useVisits = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await visitsAPI.getAll();
      setVisits(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visits');
    } finally {
      setLoading(false);
    }
  }, []);

  const createVisit = useCallback(async (visitData: any) => {
    try {
      await visitsAPI.create(visitData);
      await fetchVisits(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to create visit');
      throw err;
    }
  }, [fetchVisits]);

  const updateVisit = useCallback(async (id: string, updates: any) => {
    try {
      await visitsAPI.update(id, updates);
      await fetchVisits(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to update visit');
      throw err;
    }
  }, [fetchVisits]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  return {
    visits,
    loading,
    error,
    createVisit,
    updateVisit,
    refreshVisits: fetchVisits
  };
};

// Hook for notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (role: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationsAPI.getByRole(role);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNotification = useCallback(async (notificationData: any) => {
    try {
      return await notificationsAPI.create(notificationData);
    } catch (err: any) {
      setError(err.message || 'Failed to create notification');
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    createNotification,
    markAsRead
  };
};

// Hook for workers
export const useWorkers = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workersAPI.getAll();
      setWorkers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  return {
    workers,
    loading,
    error,
    refreshWorkers: fetchWorkers
  };
};

// Hook for anganwadis
export const useAnganwadis = () => {
  const [anganwadis, setAnganwadis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnganwadis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await anganwadisAPI.getAll();
      setAnganwadis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch anganwadis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnganwadis();
  }, [fetchAnganwadis]);

  return {
    anganwadis,
    loading,
    error,
    refreshAnganwadis: fetchAnganwadis
  };
};