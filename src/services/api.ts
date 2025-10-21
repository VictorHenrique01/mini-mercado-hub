import axios from 'axios';
import type { AuthResponse, RegisterData, LoginData, ActivateData, Product, Sale } from '@/types';

// Configure a URL base do seu backend aqui
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('seller');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: async (data: RegisterData) => {
    const response = await api.post('/api/users/register', data);
    return response.data;
  },

  activate: async (data: ActivateData) => {
    const response = await api.post('/api/users/activate', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/api/users/login', data);
    return response.data;
  },
};

// Users APIs
export const usersAPI = {
  getById: async (id: number) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<RegisterData>) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  inactivate: async (id: number) => {
    const response = await api.post(`/api/users/${id}/inactivate`);
    return response.data;
  },
};

// Products APIs
export const productsAPI = {
  getAll: async () => {
    const response = await api.get<Product[]>('/produtos');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Product>(`/produtos/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product>) => {
    const response = await api.post<Product>('/produtos', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Product>) => {
    const response = await api.put<Product>(`/produtos/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
  },
};

// Sales APIs
export const salesAPI = {
  getAll: async () => {
    const response = await api.get<Sale[]>('/vendas');
    return response.data;
  },

  create: async (data: { produto_id: number; quantidade: number }) => {
    const response = await api.post<Sale>('/vendas', data);
    return response.data;
  },
};

export default api;
