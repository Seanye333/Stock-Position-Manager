import api from './client';

export const getPortfolioSummary = () => api.get('/portfolio/summary').then(r => r.data);
export const getSectors = () => api.get('/portfolio/sectors').then(r => r.data);
export const getHistory = () => api.get('/portfolio/history').then(r => r.data);
export const captureSnapshot = () => api.post('/portfolio/snapshot').then(r => r.data);
