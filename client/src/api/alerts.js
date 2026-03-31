import api from './client';

export const getAlerts = (activeOnly) => {
  const params = activeOnly ? '?active=true' : '';
  return api.get(`/alerts${params}`).then(r => r.data);
};
export const getTriggeredAlerts = () => api.get('/alerts/triggered').then(r => r.data);
export const createAlert = (data) => api.post('/alerts', data).then(r => r.data);
export const updateAlert = (id, data) => api.put(`/alerts/${id}`, data).then(r => r.data);
export const deleteAlert = (id) => api.delete(`/alerts/${id}`).then(r => r.data);
export const checkAlerts = () => api.post('/alerts/check').then(r => r.data);
