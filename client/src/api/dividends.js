import api from './client';

export const getDividends = (positionId) => {
  const params = positionId ? `?position_id=${positionId}` : '';
  return api.get(`/dividends${params}`).then(r => r.data);
};
export const getDividendSummary = () => api.get('/dividends/summary').then(r => r.data);
export const createDividend = (data) => api.post('/dividends', data).then(r => r.data);
export const deleteDividend = (id) => api.delete(`/dividends/${id}`).then(r => r.data);
