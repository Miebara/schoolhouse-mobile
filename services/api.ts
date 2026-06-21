import axios from 'axios';
import { storage } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  registerAdmin: (data: object) => api.post('/auth/register/admin', data),
  registerParent: (data: object) => api.post('/auth/register/parent', data),
  registerTeacher: (data: object) => api.post('/auth/register/teacher', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  searchSchools: (q: string) => api.get(`/auth/schools/search?q=${encodeURIComponent(q)}`),
};

// ── Notices ───────────────────────────────────────────────────────────────────
export const noticeService = {
  getAll: () => api.get('/notices'),
  create: (data: object) => api.post('/notices', data),
  update: (id: string, data: object) => api.patch(`/notices/${id}`, data),
  delete: (id: string) => api.delete(`/notices/${id}`),
  addComment: (id: string, body: string) => api.post(`/notices/${id}/comments`, { body }),
};

// ── Posts ─────────────────────────────────────────────────────────────────────
export const postService = {
  getAll: () => api.get('/posts'),
  create: (data: object) => api.post('/posts', data),
  delete: (id: string) => api.delete(`/posts/${id}`),
  addComment: (id: string, body: string) => api.post(`/posts/${id}/comments`, { body }),
};

// ── School ────────────────────────────────────────────────────────────────────
export const schoolService = {
  getMine: () => api.get('/schools/mine'),
  update: (data: object) => api.patch('/schools/mine', data),
  getStats: () => api.get('/schools/mine/stats'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userService = {
  getPending: () => api.get('/users/pending'),
  getAll: (params?: object) => api.get('/users', { params }),
  approve: (userId: string) => api.post(`/users/${userId}/approve`),
  reject: (userId: string) => api.post(`/users/${userId}/reject`),
  deactivate: (userId: string) => api.post(`/users/${userId}/deactivate`),
};

// ── Classes ───────────────────────────────────────────────────────────────────
export const classService = {
  getAll: () => api.get('/classes'),
  create: (name: string) => api.post('/classes', { name }),
  delete: (id: string) => api.delete(`/classes/${id}`),
  assignTeacher: (classId: string, teacherId: string) =>
    api.post(`/classes/${classId}/assign-teacher`, { teacherId }),
  getStudents: (classId: string) => api.get(`/classes/${classId}/students`),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatService = {
  getMyChats: () => api.get('/chats'),
  getMessages: (chatId: string) => api.get(`/chats/${chatId}/messages`),
  createDirect: (targetUserId: string) => api.post('/chats/direct', { targetUserId }),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentService = {
  initialize: (data: object) => api.post('/payments/initialize', data),
  verify: (reference: string) => api.get(`/payments/verify/${reference}`),
  getTransactions: () => api.get('/payments/transactions'),
};
