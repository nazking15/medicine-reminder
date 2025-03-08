import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://medicine-reminder-hazel.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const medicineService = {
  getAllMedicines: (userId) => api.get(`/medicines/${userId}`),
  addMedicine: (medicineData) => api.post('/medicines', medicineData),
  updateMedicine: (id, medicineData) => api.patch(`/medicines/${id}`, medicineData),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`),
};

export const healthCheck = () => api.get('/health');

export default api; 