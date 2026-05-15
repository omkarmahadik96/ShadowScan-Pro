import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

export const findingsApi = {
  getAll: () => api.get('/findings'),
  getById: (id: string) => api.get(`/findings/${id}`),
};

export const watchlistApi = {
  getAll: () => api.get('/watchlist'),
  add: (item: any) => api.get('/watchlist', { params: { value: item.value } }), // Simplified for this demo
  delete: (id: string) => api.delete(`/watchlist/${id}`),
};

export default api;
