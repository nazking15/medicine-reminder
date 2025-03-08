import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const medicineService = {
  getAllMedicines: (userId) => api.get(`/medicines/${userId}`),
  addMedicine: (medicineData) => api.post('/medicines', medicineData),
  updateMedicine: (id, medicineData) => api.patch(`/medicines/${id}`, medicineData),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`),
};

export const healthCheck = () => api.get('/health');

export default api; 