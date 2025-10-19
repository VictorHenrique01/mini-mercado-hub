import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Store className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sistema de Gestão para Mini Mercados
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Controle seu estoque, gerencie vendas e impulsione seu negócio com nossa plataforma completa
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth/register')}>
              Criar Conta Grátis
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth/login')}>
              Fazer Login
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestão de Estoque</h3>
            <p className="text-muted-foreground">
              Controle completo dos seus produtos com atualizações em tempo real
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <ShoppingCart className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Registro de Vendas</h3>
            <p className="text-muted-foreground">
              Registre vendas rapidamente e acompanhe o histórico completo
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Análises e Relatórios</h3>
            <p className="text-muted-foreground">
              Visualize métricas importantes do seu negócio em um dashboard intuitivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
