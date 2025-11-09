import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Seller } from '@/types';

interface AuthContextType {
  seller: Seller | null;
  isAuthenticated: boolean;
  isLoading: boolean; // ✅ ADICIONE ISSO
  login: (token: string, seller: Seller) => void;
  logout: () => void;
  updateSeller: (sellerData: Seller) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ✅ ESTADO DE LOADING

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedSeller = localStorage.getItem('seller');

    if (token && savedSeller) {
      try {
        const sellerData = JSON.parse(savedSeller);
        setSeller(sellerData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao carregar dados do seller:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('seller');
      }
    }
    
    setIsLoading(false); // ✅ MARCA QUE TERMINOU A VERIFICAÇÃO
  }, []);

  const login = useCallback((token: string, sellerData: Seller) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('seller', JSON.stringify(sellerData));
    setSeller(sellerData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('seller');
    setSeller(null);
    setIsAuthenticated(false);
  }, []);

  const updateSeller = useCallback((sellerData: Seller) => {
    localStorage.setItem('seller', JSON.stringify(sellerData));
    setSeller(sellerData);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      seller, 
      isAuthenticated, 
      isLoading, // ✅ EXPORTA isLoading
      login, 
      logout, 
      updateSeller 
    }}> 
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