import api from './client';

export const getRiskMetrics = () => api.get('/risk/metrics').then(r => r.data);
