export interface Seller {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  celular: string;
  status: 'Ativo' | 'Inativo';
  created_at?: string;
  // Outras propriedades do seller se existirem
}

export interface Product {
  id: number;
  seller_id: number;
  nome: string;
  preco: number;
  quantidade: number;
  status: 'Ativo' | 'Inativo';
  imagem_url?: string;
  created_at?: string;
  // Outras propriedades do produto se existirem
}

export interface Sale {
  id: number;
  seller_id: number;
  produto_id: number;
  quantidade: number;
  valor_total: number;
  created_at: string;
  produto?: Product; // Campo opcional
  // Outras propriedades da venda se existirem
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  seller: Seller;
}

export interface RegisterData {
  nome: string;
  cnpj: string;
  email: string;
  celular: string;
  senha: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface ActivateData {
  email: string;
  codigo: string;
}

// Novo type para a função de atualização do vendedor
export type UpdateSellerData = Partial<Omit<RegisterData, 'senha'>>;

// Novo type para a função de criação de produto (assumindo que o ID e seller_id são gerados no backend)
export type CreateProductData = Pick<Product, 'nome' | 'preco' | 'quantidade' | 'status' | 'imagem_url'>;

// Novo type para a função de atualização de produto
export type UpdateProductData = Partial<Omit<CreateProductData, 'status'>>; // Mantém 'status' fora se a inativação for separada, ou inclua se for atualização geral

// Novo type para a função de criação de venda
export interface CreateSaleData {
  produto_id: number;
  quantidade: number;
}