import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store, Package, ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { seller, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">{seller?.nome || 'MercadoSystem'}</span>
            </Link>

            <div className="hidden md:flex space-x-1">
              <Link to="/dashboard">
                <Button
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Store className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <Link to="/products">
                <Button
                  variant={isActive('/products') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  Produtos
                </Button>
              </Link>

              <Link to="/sales">
                <Button
                  variant={isActive('/sales') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Vendas
                </Button>
              </Link>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
};
