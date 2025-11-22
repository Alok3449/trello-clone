import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
};

// Board API
export const boardAPI = {
  getBoards: () => api.get('/boards'),
  getBoard: (id) => api.get(`/boards/${id}`),
  createBoard: (data) => api.post('/boards', data),
  updateBoard: (id, data) => api.put(`/boards/${id}`, data),
  deleteBoard: (id) => api.delete(`/boards/${id}`),
  
  addMember: (boardId, email) => api.post(`/boards/${boardId}/members`, { email }),
  removeMember: (boardId, memberId) => api.delete(`/boards/${boardId}/members/${memberId}`),
  
  addList: (boardId, title) => api.post(`/boards/${boardId}/lists`, { title }),
  updateList: (boardId, listId, data) => api.put(`/boards/${boardId}/lists/${listId}`, data),
  deleteList: (boardId, listId) => api.delete(`/boards/${boardId}/lists/${listId}`),
  
  addCard: (boardId, listId, data) => api.post(`/boards/${boardId}/lists/${listId}/cards`, data),
  updateCard: (boardId, listId, cardId, data) => api.put(`/boards/${boardId}/lists/${listId}/cards/${cardId}`, data),
  deleteCard: (boardId, listId, cardId) => api.delete(`/boards/${boardId}/lists/${listId}/cards/${cardId}`),
};

// Recommendations API
export const recommendationAPI = {
  getRecommendations: (boardId) => api.get(`/recommendations/${boardId}`)
};

export default api;