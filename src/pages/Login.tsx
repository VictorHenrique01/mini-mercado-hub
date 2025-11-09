import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    login: '',
    senha: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      console.log('✅ Login success - Data received:', data);
      
      // ✅ VERIFIQUE O QUE A API ESTÁ RETORNANDO
      if (!data.token) {
        console.error('❌ No token in response:', data);
        toast.error('Token não recebido da API');
        return;
      }

      // ✅ VERIFIQUE SE TEM USER/SELLER
      const sellerData = data.user || data.seller;
      if (!sellerData) {
        console.error('❌ No user/seller in response:', data);
        toast.error('Dados do usuário não recebidos');
        return;
      }

      console.log('🔑 Calling login function with:', {
        token: data.token,
        seller: sellerData
      });

      login(data.token, sellerData);
      toast.success('Login realizado com sucesso!');
      
      console.log('🚀 Navigating to /dashboard');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      const errorMessage = error.response?.data?.erro || error.response?.data?.detail || error.message || 'Erro ao fazer login';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 Submitting login form:', formData);
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription>Entre com suas credenciais para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">E-mail ou CNPJ</Label>
              <Input
                id="login"
                name="login"
                type="text"
                placeholder="seu@email.com ou CNPJ"
                value={formData.login}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="••••••••"
                value={formData.senha}
                onChange={handleChange}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link to="/auth/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}