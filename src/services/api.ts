import axios from 'axios';
import type { AuthResponse, RegisterData, LoginData, ActivateData, Product, Sale } from '@/types';

// Configure a URL base do seu backend aqui
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://estoque-web.onrender.com';

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
    const response = await api.post('/register', data);
    return response.data;
  },

  activate: async (data: ActivateData) => {
    const response = await api.post('/activate', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/login', data);
    return response.data;
  },
};

// Users APIs
export const usersAPI = {
  getById: async (id: number) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<RegisterData>) => {
    const response = await api.put(`/user/${id}`, data);
    return response.data;
  },

  inactivate: async (id: number) => {
    const response = await api.post(`/user/${id}/inactivate`);
    return response.data;
  },
};

// Products APIs (--- CORRIGIDO ---)
export const productsAPI = {
  getAll: async () => {
    // Adicionado o prefixo /api/products
    const response = await api.get<Product[]>('/api/products');
    return response.data;
  },

  getById: async (id: number) => {
    // Adicionado o prefixo /api/products
    const response = await api.get<Product>(`/api/products/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product>) => {
    // Adicionado o prefixo /api/products
    const response = await api.post<Product>('/api/products', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Product>) => {
    // Adicionado o prefixo /api/products
    const response = await api.put<Product>(`/api/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    // Adicionado o prefixo /api/products
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },
};

// Sales APIs (--- CORRIGIDO ---)
export const salesAPI = {
  getAll: async () => {
    // Adicionado o prefixo /api/vendas (ou /api/sales, dependendo do seu backend)
    const response = await api.get<Sale[]>('/api/vendas');
    return response.data;
  },

  create: async (data: { produto_id: number; quantidade: number }) => {
    // Adicionado o prefixo /api/vendas
    const response = await api.post<Sale>('/api/vendas', data);
    return response.data;
  },
};

export default api;

