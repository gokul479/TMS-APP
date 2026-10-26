import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your Computer's Wi-Fi IP Address: 10.249.68.142
const LOCAL_HOST_IP = '10.249.68.142';
const DEFAULT_LOCAL_IP = Platform.OS === 'web' ? 'localhost' : LOCAL_HOST_IP;
export const BASE_URL = `http://${DEFAULT_LOCAL_IP}:5000/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Auth JWT Token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching auth token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const complaintService = {
  create: (formData) =>
    api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  getStats: () => api.get('/complaints/stats'),
  assign: (id, assignedTo) => api.patch(`/complaints/${id}/assign`, { assignedTo }),
  updateStatus: (id, status) => api.patch(`/complaints/${id}/status`, { status }),
  report: (params) => api.get('/complaints/report', { params }),
};

export const departmentService = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const programmeService = {
  getAll: (params) => api.get('/programmes', { params }),
  create: (data) => api.post('/programmes', data),
  update: (id, data) => api.put(`/programmes/${id}`, data),
  delete: (id) => api.delete(`/programmes/${id}`),
};

export const blockService = {
  getAll: (params) => api.get('/blocks', { params }),
  create: (data) => api.post('/blocks', data),
  update: (id, data) => api.put(`/blocks/${id}`, data),
  delete: (id) => api.delete(`/blocks/${id}`),
};

export const roomService = {
  getAll: (params) => api.get('/rooms', { params }),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const roleService = {
  getAll: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
};

export default api;
