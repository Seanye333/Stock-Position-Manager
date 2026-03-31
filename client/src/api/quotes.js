import api from './client';

export const getQuote = (ticker) => api.get(`/quotes/${ticker}`).then(r => r.data);
export const getBatchQuotes = (tickers) => api.get(`/quotes/batch?tickers=${tickers.join(',')}`).then(r => r.data);
export const getHistory = (ticker, period) => api.get(`/quotes/${ticker}/history?period=${period || '3mo'}`).then(r => r.data);
