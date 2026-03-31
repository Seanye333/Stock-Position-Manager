import api from './client';

export const getPositions = () => api.get('/positions').then(r => r.data);
export const getPosition = (id) => api.get(`/positions/${id}`).then(r => r.data);
export const createPosition = (data) => api.post('/positions', data).then(r => r.data);
export const updatePosition = (id, data) => api.put(`/positions/${id}`, data).then(r => r.data);
export const deletePosition = (id) => api.delete(`/positions/${id}`).then(r => r.data);
