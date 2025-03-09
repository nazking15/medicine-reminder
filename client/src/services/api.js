import axios from 'axios';

// Use environment variables for API URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api'
    : 'https://medicine-reminder-hazel.vercel.app/api');

console.log('Environment:', process.env.NODE_ENV);
console.log('API base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor for authentication and logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding auth token to request');
    } else {
      console.warn('No auth token found in localStorage');
    }
    
    console.log('Making request to:', config.url);
    console.log('Request headers:', config.headers);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and token handling
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error - clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const medicineService = {
  getAllMedicines: (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return Promise.reject(new Error('No authentication token found'));
    }
    return api.get(`/medicines/${userId}`);
  },
  addMedicine: (medicineData) => api.post('/medicines', medicineData),
  updateMedicine: (id, medicineData) => api.patch(`/medicines/${id}`, medicineData),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`),
};

export const healthCheck = () => api.get('/health');

export default api; 