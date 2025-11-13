import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': '1' // Pour le développement
  }
});

// Contacts API
export const contactsAPI = {
  getAll: () => api.get('/contacts'),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  getFollowUps: () => api.get('/contacts/followups')
};

// Companies API
export const companiesAPI = {
  getAll: () => api.get('/companies'),
  getWithStats: () => api.get('/companies/stats'),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`)
};

// Applications API
export const applicationsAPI = {
  getAll: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  getStats: () => api.get('/applications/stats')
};

// Opportunities API
export const opportunitiesAPI = {
  getAll: () => api.get('/opportunities'),
  getActive: () => api.get('/opportunities/active'),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`)
};

// Interactions API
export const interactionsAPI = {
  getAll: () => api.get('/interactions'),
  getByContact: (contactId) => api.get(`/interactions/contact/${contactId}`),
  create: (data) => api.post('/interactions', data),
  delete: (id) => api.delete(`/interactions/${id}`)
};

export default api;
