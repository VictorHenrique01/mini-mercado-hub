import axios from 'axios';
import type { AuthResponse, RegisterData, LoginData, ActivateData, Product, Sale } from '@/types';

// Configure a URL base do seu backend aqui
// Esta linha está CORRETA. Ela vai ler a variável do Vercel.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ Timeout para evitar requisições travadas
  timeout: 10000,
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação e rede
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Tratamento melhorado de erros
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('seller');
      window.location.href = '/auth/login';
    }
    
    // ✅ Tratamento de erro de rede/CORS
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.error('Erro de rede - Verifique a conexão e CORS');
      return Promise.reject(new Error('Erro de conexão. Verifique se o servidor está online.'));
    }
    
    // ✅ Tratamento de timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição');
      return Promise.reject(new Error('Tempo limite excedido. Tente novamente.'));
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs (Estavam corretas)
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
    const response = await api.get<Product[]>('/api/products');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Product>(`/api/products/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product>) => {
    const response = await api.post<Product>('/api/products', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Product>) => {
    const response = await api.put<Product>(`/api/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  inactivate: async (id: number) => {
    const response = await api.patch(`/api/products/${id}/inactivate`);
    return response.data;
  },
};

// Sales APIs
export const salesAPI = {
  getAll: async () => {
    const response = await api.get<Sale[]>('/api/sales');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Sale>(`/api/sales/${id}`);
    return response.data;
  },

  create: async (data: { produto_id: number; quantidade: number }) => {
    const response = await api.post<Sale>('/api/sales', data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/sales/${id}`);
    return response.data;
  },
};

// ✅ Adicione uma função para testar a conexão
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export default api;