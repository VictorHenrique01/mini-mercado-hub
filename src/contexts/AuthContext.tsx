import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Seller } from '@/types';

interface AuthContextType {
  seller: Seller | null;
  isAuthenticated: boolean;
  login: (token: string, seller: Seller) => void;
  logout: () => void;
  updateSeller: (sellerData: Seller) => void; // ⬅️ Adicionado
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verifica se existe token e seller no localStorage
    const token = localStorage.getItem('access_token');
    const savedSeller = localStorage.getItem('seller');

    if (token && savedSeller) {
      try {
        setSeller(JSON.parse(savedSeller));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao carregar dados do seller:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('seller');
      }
    }
  }, []);

  const login = (token: string, sellerData: Seller) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('seller', JSON.stringify(sellerData));
    setSeller(sellerData);
    setIsAuthenticated(true);
  };
    
  // ⬅️ NOVO: Atualiza os dados do vendedor no estado e no localStorage
  const updateSeller = (sellerData: Seller) => {
    localStorage.setItem('seller', JSON.stringify(sellerData));
    setSeller(sellerData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('seller');
    setSeller(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ seller, isAuthenticated, login, logout, updateSeller }}> 
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};