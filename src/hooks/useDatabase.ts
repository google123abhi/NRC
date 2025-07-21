// React hook for database operations
import { useState, useEffect, useCallback } from 'react';
import { createDatabaseService, DatabaseConfig } from '../services/database';

// Database configuration - replace with your actual database credentials
const DB_CONFIG: DatabaseConfig = {
  host: process.env.REACT_APP_DB_HOST || 'localhost',
  port: parseInt(process.env.REACT_APP_DB_PORT || '5432'),
  database: process.env.REACT_APP_DB_NAME || 'nrc_management',
  username: process.env.REACT_APP_DB_USER || 'postgres',
  password: process.env.REACT_APP_DB_PASSWORD || 'password'
};

export const useDatabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ReturnType<typeof createDatabaseService> | null>(null);

  // Initialize database connection
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dbServices = createDatabaseService(DB_CONFIG);
      await dbServices.db.connect();
      setServices(dbServices);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database connection failed');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect from database
  const disconnect = useCallback(async () => {
    if (services) {
      await services.db.disconnect();
      setServices(null);
      setIsConnected(false);
    }
  }, [services]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      if (services) {
        services.db.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    services,
    connect,
    disconnect
  };
};

// Hook for patient operations
export const usePatients = () => {
  const { services, isConnected } = useDatabase();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPatients = useCallback(async () => {
    if (!services || !isConnected) return;

    setLoading(true);
    try {
      const data = await services.patients.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  }, [services, isConnected]);

  const createPatient = useCallback(async (patientData: any) => {
    if (!services || !isConnected) return null;

    try {
      const newPatient = await services.patients.createPatient(patientData);
      await fetchPatients(); // Refresh list
      return newPatient;
    } catch (error) {
      console.error('Failed to create patient:', error);
      throw error;
    }
  }, [services, isConnected, fetchPatients]);

  const updatePatient = useCallback(async (id: string, updates: any) => {
    if (!services || !isConnected) return null;

    try {
      const updatedPatient = await services.patients.updatePatient(id, updates);
      await fetchPatients(); // Refresh list
      return updatedPatient;
    } catch (error) {
      console.error('Failed to update patient:', error);
      throw error;
    }
  }, [services, isConnected, fetchPatients]);

  const deletePatient = useCallback(async (id: string) => {
    if (!services || !isConnected) return;

    try {
      await services.patients.deletePatient(id);
      await fetchPatients(); // Refresh list
    } catch (error) {
      console.error('Failed to delete patient:', error);
      throw error;
    }
  }, [services, isConnected, fetchPatients]);

  useEffect(() => {
    if (isConnected) {
      fetchPatients();
    }
  }, [isConnected, fetchPatients]);

  return {
    patients,
    loading,
    createPatient,
    updatePatient,
    deletePatient,
    refreshPatients: fetchPatients
  };
};

// Hook for medical records
export const useMedicalRecords = () => {
  const { services, isConnected } = useDatabase();

  const getPatientMedicalHistory = useCallback(async (patientId: string) => {
    if (!services || !isConnected) return [];

    try {
      return await services.medicalRecords.getPatientMedicalHistory(patientId);
    } catch (error) {
      console.error('Failed to fetch medical history:', error);
      return [];
    }
  }, [services, isConnected]);

  const createMedicalRecord = useCallback(async (recordData: any) => {
    if (!services || !isConnected) return null;

    try {
      return await services.medicalRecords.createMedicalRecord(recordData);
    } catch (error) {
      console.error('Failed to create medical record:', error);
      throw error;
    }
  }, [services, isConnected]);

  return {
    getPatientMedicalHistory,
    createMedicalRecord
  };
};

// Hook for bed operations
export const useBeds = () => {
  const { services, isConnected } = useDatabase();
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBeds = useCallback(async () => {
    if (!services || !isConnected) return;

    setLoading(true);
    try {
      const data = await services.beds.getAllBeds();
      setBeds(data);
    } catch (error) {
      console.error('Failed to fetch beds:', error);
    } finally {
      setLoading(false);
    }
  }, [services, isConnected]);

  const updateBed = useCallback(async (bedId: string, updates: any) => {
    if (!services || !isConnected) return null;

    try {
      const updatedBed = await services.beds.updateBedStatus(bedId, updates);
      await fetchBeds(); // Refresh list
      return updatedBed;
    } catch (error) {
      console.error('Failed to update bed:', error);
      throw error;
    }
  }, [services, isConnected, fetchBeds]);

  useEffect(() => {
    if (isConnected) {
      fetchBeds();
    }
  }, [isConnected, fetchBeds]);

  return {
    beds,
    loading,
    updateBed,
    refreshBeds: fetchBeds
  };
};

// Hook for notifications
export const useNotifications = () => {
  const { services, isConnected } = useDatabase();
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = useCallback(async (userRole: string) => {
    if (!services || !isConnected) return;

    try {
      const data = await services.notifications.getNotificationsByRole(userRole);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [services, isConnected]);

  const createNotification = useCallback(async (notificationData: any) => {
    if (!services || !isConnected) return null;

    try {
      return await services.notifications.createNotification(notificationData);
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }, [services, isConnected]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!services || !isConnected) return;

    try {
      await services.notifications.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [services, isConnected]);

  return {
    notifications,
    fetchNotifications,
    createNotification,
    markAsRead
  };
};