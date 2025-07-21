import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { username: string; password: string; employee_id: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Patients API
export const patientsAPI = {
  getAll: async () => {
    const response = await api.get('/patients');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  
  create: async (patientData: any) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },
  
  update: async (id: string, updates: any) => {
    const response = await api.put(`/patients/${id}`, updates);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};

// Medical Records API
export const medicalRecordsAPI = {
  getByPatientId: async (patientId: string) => {
    const response = await api.get(`/medical-records/patient/${patientId}`);
    return response.data;
  },
  
  create: async (recordData: any) => {
    const response = await api.post('/medical-records', recordData);
    return response.data;
  },
};

// Beds API
export const bedsAPI = {
  getAll: async () => {
    const response = await api.get('/beds');
    return response.data;
  },
  
  update: async (id: string, updates: any) => {
    const response = await api.put(`/beds/${id}`, updates);
    return response.data;
  },
};

// Visits API
export const visitsAPI = {
  getAll: async () => {
    const response = await api.get('/visits');
    return response.data;
  },
  
  create: async (visitData: any) => {
    const response = await api.post('/visits', visitData);
    return response.data;
  },
  
  update: async (id: string, updates: any) => {
    const response = await api.put(`/visits/${id}`, updates);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getByRole: async (role: string) => {
    const response = await api.get(`/notifications/role/${role}`);
    return response.data;
  },
  
  create: async (notificationData: any) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },
  
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
};

// Workers API
export const workersAPI = {
  getAll: async () => {
    const response = await api.get('/workers');
    return response.data;
  },
};

// Anganwadis API
export const anganwadisAPI = {
  getAll: async () => {
    const response = await api.get('/anganwadis');
    return response.data;
  },
  
  create: async (anganwadiData: any) => {
    const response = await api.post('/anganwadis', anganwadiData);
    return response.data;
  },
  
  update: async (id: string, updates: any) => {
    const response = await api.put(`/anganwadis/${id}`, updates);
    return response.data;
  },
};

// Workers API
export const workersAPI = {
  getAll: async () => {
    const response = await api.get('/workers');
    return response.data;
  },
  
  create: async (workerData: any) => {
    const response = await api.post('/workers', workerData);
    return response.data;
  },
  
  update: async (id: string, updates: any) => {
    const response = await api.put(`/workers/${id}`, updates);
    return response.data;
  },
};

// Bed Requests API
export const bedRequestsAPI = {
  getAll: async () => {
    const response = await api.get('/bed-requests');
    return response.data;
  },
  
  create: async (requestData: any) => {
    const response = await api.post('/bed-requests', requestData);
    return response.data;
  }
}
export default api;