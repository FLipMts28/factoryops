import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Production Lines
export const productionLinesApi = {
  getAll: () => api.get('/production-lines'),
  getOne: (id: string) => api.get(`/production-lines/${id}`),
};

// Machines
export const machinesApi = {
  getAll: () => api.get('/machines'),
  getOne: (id: string) => api.get(`/machines/${id}`),
  updateStatus: (id: string, status: string) => 
    api.patch(`/machines/${id}/status`, { status }),
};

// Annotations
export const annotationsApi = {
  getByMachine: (machineId: string) => api.get(`/annotations/machine/${machineId}`),
  create: (data: any) => api.post('/annotations', data),
  update: (id: string, data: any) => api.put(`/annotations/${id}`, data),
  delete: (id: string) => api.delete(`/annotations/${id}`),
};
