export interface Seller {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  celular: string;
  status: 'Ativo' | 'Inativo';
  created_at?: string;
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
}

export interface Sale {
  id: number;
  seller_id: number;
  produto_id: number;
  quantidade: number;
  valor_total: number;
  created_at: string;
  produto?: Product;
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
