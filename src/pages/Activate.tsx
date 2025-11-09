import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query'; // ✅ ADICIONE ESTE IMPORT
import { Store, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/api'; // ✅ CORRIGIDO IMPORT
import { toast } from 'sonner';

export default function Activate() {
  const navigate = useNavigate();
  const location = useLocation();
  const cnpj = location.state?.cnpj || ''; // ✅ CORRIGIDO: cnpj em vez de email
  const [codigo, setCodigo] = useState('');

  // ✅ USE MUTATION PARA ATIVAÇÃO
  const activateMutation = useMutation({
    mutationFn: authAPI.activate,
    onSuccess: () => {
      toast.success('Conta ativada com sucesso!');
      navigate('/auth/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.erro || 'Código inválido');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cnpj) {
      toast.error('CNPJ não encontrado. Volte para o cadastro.');
      return;
    }

    // ✅ ENVIA CNPJ EM VEZ DE EMAIL
    activateMutation.mutate({ cnpj, codigo });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Ativar Conta</CardTitle>
          <CardDescription>
            Digite o código de 4 dígitos enviado para seu WhatsApp
            {cnpj && <div className="mt-2 text-xs">CNPJ: {cnpj}</div>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código de Ativação</Label>
              <Input
                id="codigo"
                name="codigo"
                placeholder="0000"
                maxLength={4}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} // ✅ Só números
                className="text-center text-2xl tracking-widest"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={activateMutation.isPending || !cnpj}
            >
              {activateMutation.isPending ? 'Ativando...' : 'Ativar Conta'}
            </Button>

            <div className="text-center text-sm">
              <Link to="/auth/login" className="text-muted-foreground hover:text-primary">
                Voltar para login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}