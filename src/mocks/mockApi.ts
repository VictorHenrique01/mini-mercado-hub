import type { AuthResponse, RegisterData, LoginData, ActivateData, Product, Sale } from '@/types';
import { mockSeller, mockProducts, mockSales } from './mockData';

// Simula delay de rede
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock de resposta de autenticação
const createAuthResponse = (): AuthResponse => ({
  access_token: 'mock_jwt_token_' + Date.now(),
  token_type: 'Bearer',
  seller: mockSeller,
});

// TODO: INTEGRAÇÃO COM BACKEND REAL
// Quando integrar com o backend Flask, substitua estas funções
// pelas chamadas reais usando axios em src/services/api.ts

export const mockAuthAPI = {
  register: async (data: RegisterData) => {
    await delay();
    console.log('📝 [MOCK] Register chamado com:', data);
    // TODO: Integrar com POST /api/users/register
    return { message: 'Cadastro realizado! Código enviado via WhatsApp.' };
  },

  activate: async (data: ActivateData) => {
    await delay();
    console.log('✅ [MOCK] Activate chamado com:', data);
    // TODO: Integrar com POST /api/users/activate
    // Aceita qualquer código de 4 dígitos para testes
    if (data.codigo.length !== 4) {
      throw new Error('Código deve ter 4 dígitos');
    }
    return { message: 'Conta ativada com sucesso!' };
  },

  login: async (data: LoginData) => {
    await delay();
    console.log('🔐 [MOCK] Login chamado com:', data);
    // TODO: Integrar com POST /api/users/login
    // Para testes, aceita qualquer email/senha
    return createAuthResponse();
  },
};

export const mockUsersAPI = {
  getById: async (id: number) => {
    await delay();
    console.log('👤 [MOCK] Get user by ID:', id);
    // TODO: Integrar com GET /api/users/{id}
    return mockSeller;
  },

  update: async (id: number, data: Partial<RegisterData>) => {
    await delay();
    console.log('📝 [MOCK] Update user:', id, data);
    // TODO: Integrar com PUT /api/users/{id}
    return { ...mockSeller, ...data };
  },

  inactivate: async (id: number) => {
    await delay();
    console.log('⚠️ [MOCK] Inactivate user:', id);
    // TODO: Integrar com POST /api/users/{id}/inactivate
    return { message: 'Conta inativada com sucesso' };
  },
};

export const mockProductsAPI = {
  getAll: async () => {
    await delay();
    console.log('📦 [MOCK] Get all products');
    // TODO: Integrar com GET /produtos
    return mockProducts;
  },

  getById: async (id: number) => {
    await delay();
    console.log('📦 [MOCK] Get product by ID:', id);
    // TODO: Integrar com GET /produtos/{id}
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Produto não encontrado');
    return product;
  },

  create: async (data: Partial<Product>) => {
    await delay();
    console.log('➕ [MOCK] Create product:', data);
    // TODO: Integrar com POST /produtos
    const newProduct: Product = {
      id: mockProducts.length + 1,
      seller_id: mockSeller.id,
      nome: data.nome || '',
      preco: data.preco || 0,
      quantidade: data.quantidade || 0,
      status: data.status || 'Ativo',
      imagem_url: data.imagem_url || '',
      created_at: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  update: async (id: number, data: Partial<Product>) => {
    await delay();
    console.log('📝 [MOCK] Update product:', id, data);
    // TODO: Integrar com PUT /produtos/{id}
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    mockProducts[index] = { ...mockProducts[index], ...data };
    return mockProducts[index];
  },

  delete: async (id: number) => {
    await delay();
    console.log('🗑️ [MOCK] Delete product:', id);
    // TODO: Integrar com DELETE /produtos/{id}
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    mockProducts.splice(index, 1);
    return { message: 'Produto excluído com sucesso' };
  },
};

export const mockSalesAPI = {
  getAll: async () => {
    await delay();
    console.log('💰 [MOCK] Get all sales');
    // TODO: Integrar com GET /vendas
    return mockSales;
  },

  create: async (data: { produto_id: number; quantidade: number }) => {
    await delay();
    console.log('➕ [MOCK] Create sale:', data);
    // TODO: Integrar com POST /vendas
    const product = mockProducts.find(p => p.id === data.produto_id);
    if (!product) throw new Error('Produto não encontrado');
    if (product.quantidade < data.quantidade) {
      throw new Error('Estoque insuficiente');
    }
    
    const newSale: Sale = {
      id: mockSales.length + 1,
      seller_id: mockSeller.id,
      produto_id: data.produto_id,
      quantidade: data.quantidade,
      valor_total: product.preco * data.quantidade,
      created_at: new Date().toISOString(),
      produto: product,
    };
    
    // Atualiza estoque do produto
    product.quantidade -= data.quantidade;
    mockSales.unshift(newSale);
    
    return newSale;
  },
};
