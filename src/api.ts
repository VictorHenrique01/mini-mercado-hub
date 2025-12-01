import axios from 'axios';
import type { AuthResponse, RegisterData, LoginData, ActivateData, Product, Sale } from '@/types';

// ✅ URL corrigida para o backend no Render
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://estoque-web-3513.onrender.com';

console.log('🌐 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 segundos é suficiente
  withCredentials: false, // Desative se não usar cookies
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log da requisição (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      console.log('📤 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação e rede
api.interceptors.response.use(
  (response) => {
    // Log da resposta (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      console.log('📥 Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      // ⚠️ MENSAGEM DE ERRO DO BACKEND - IMPORTANTE!
      data: error.response?.data,
      headers: error.response?.headers,
      code: error.code,
      message: error.message,
    });
    
    // Se houver resposta do servidor com mensagem de erro
    const backendError = error.response?.data?.erro || 
                        error.response?.data?.detail || 
                        error.response?.data?.message;
    
    if (backendError) {
      console.log('📢 Backend error message:', backendError);
    }
    
    // Tratar erros específicos
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Redirecting to login');
      localStorage.removeItem('access_token');
      localStorage.removeItem('seller');
      
      // Evitar redirecionamento infinito
      if (!window.location.pathname.includes('/auth/login')) {
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 100);
      }
      
      return Promise.reject({
        ...error,
        message: backendError || 'Sessão expirada. Faça login novamente.',
        isAuthError: true,
      });
    }
    
    // Erro 400 - Bad Request
    if (error.response?.status === 400) {
      return Promise.reject({
        ...error,
        message: backendError || 'Requisição inválida.',
        isBadRequest: true,
      });
    }
    
    // Erro 404 - Not Found
    if (error.response?.status === 404) {
      return Promise.reject({
        ...error,
        message: backendError || 'Recurso não encontrado.',
        isNotFound: true,
      });
    }
    
    // Erro 500 - Internal Server Error
    if (error.response?.status >= 500) {
      console.error('🔥 Server Error:', error.response?.data);
      return Promise.reject({
        ...error,
        message: backendError || 'Erro interno do servidor. Tente novamente mais tarde.',
        isServerError: true,
      });
    }
    
    // Erros de rede/timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.warn('⏱️ Timeout - Server might be waking up');
      return Promise.reject({
        ...error,
        message: 'Tempo de resposta excedido. O servidor pode estar iniciando.',
        isTimeout: true,
      });
    }
    
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.warn('🌐 Network error');
      return Promise.reject({
        ...error,
        message: 'Erro de conexão. Verifique sua internet.',
        isNetworkError: true,
      });
    }
    
    // Erro genérico
    return Promise.reject({
      ...error,
      message: backendError || error.message || 'Erro desconhecido',
    });
  }
);

// ✅ Auth APIs
export const authAPI = {
  register: async (data: RegisterData) => {
    console.log('👤 Register attempt:', { email: data.email, cnpj: data.cnpj });
    const response = await api.post('/api/users/register', data);
    return response.data;
  },

  activate: async (data: ActivateData) => {
    console.log('🔓 Activation attempt:', { token: data.token?.substring(0, 20) + '...' });
    const response = await api.post('/api/users/activate', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    console.log('🔑 Login attempt:', { login: data.login });
    const response = await api.post('/api/users/login', data);
    console.log('✅ Login response:', {
      hasToken: !!response.data?.token,
      tokenPreview: response.data?.token ? response.data.token.substring(0, 20) + '...' : 'No token',
      userData: response.data?.user || response.data?.seller,
    });
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
export const testConnection = async (retries = 3) => {
  console.log('🔍 Testing server connection...');
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' },
      });
      
      console.log('✅ Server is online:', response.data);
      return { 
        success: true, 
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      console.warn(`⚠️ Connection attempt ${i + 1}/${retries} failed:`, error.message);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  return { 
    success: false, 
    error: 'Could not connect to server after multiple attempts',
  };
};

// ✅ Função para verificar status do servidor
export const checkServerStatus = async () => {
  try {
    const startTime = Date.now();
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
      headers: { 'Accept': 'application/json' },
    });
    const latency = Date.now() - startTime;
    
    return {
      online: true,
      latency,
      status: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      online: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

// ✅ Função para "acordar" o servidor se estiver hibernando
export const wakeServer = async () => {
  console.log('🔔 Attempting to wake server...');
  
  try {
    // Primeiro, tente health check rápido
    await axios.get(`${API_BASE_URL}/health`, {
      timeout: 15000,
      headers: { 'Accept': 'application/json' },
    });
    
    console.log('✅ Server is already awake');
    return true;
  } catch (error: any) {
    console.log('💤 Server might be sleeping, trying to wake...');
    
    // Se falhar, tente uma requisição que acorde o servidor
    try {
      await axios.get(`${API_BASE_URL}/`, {
        timeout: 30000, // Tempo maior para servidor iniciar
        headers: { 'Accept': 'application/json' },
      });
      
      console.log('✅ Server woke up successfully');
      return true;
    } catch (wakeError) {
      console.error('❌ Failed to wake server:', wakeError.message);
      return false;
    }
  }
};

export default api;