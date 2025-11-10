import axios from 'axios';
import type { AuthResponse, RegisterData, LoginData, ActivateData, Product, Sale } from '@/types';

// ✅ URL corrigida para o backend no Render
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://estoque-web.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // ✅ 60 segundos para primeira requisição (servidor hibernando)
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
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('seller');
      window.location.href = '/auth/login';
    }
    
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.warn('⚠️ Erro de rede detectado');
      return Promise.reject({ 
        ...error,
        message: 'Erro de conexão. Verifique se o servidor está online.',
        isNetworkError: true 
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      console.warn('⏱️ Timeout detectado - Servidor pode estar iniciando');
      return Promise.reject({ 
        ...error,
        message: 'Servidor iniciando, aguarde...',
        isTimeout: true 
      });
    }
    
    return Promise.reject(error);
  }
);

// ✅ Auth APIs CORRIGIDAS - usando as rotas corretas do backend
export const authAPI = {
  register: async (data: RegisterData) => {
    const response = await api.post('/api/users/register', data); // ✅ Corrigido
    return response.data;
  },

  activate: async (data: ActivateData) => {
    const response = await api.post('/api/users/activate', data); // ✅ Corrigido
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/api/users/login', data); // ✅ Corrigido
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
    const response = await api.delete(`/api/users/${id}`);
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

// ✅ Função para testar a conexão
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export default api;