import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
// 🚀 INTEGRAÇÃO: Usando AuthContext atualizado
import { useAuth } from '@/contexts/AuthContext';
// 🚀 INTEGRAÇÃO: Usando API real
import { usersAPI } from '@/services/api';
import { toast } from 'sonner';

export default function Profile() {
  // ➡️ ATUALIZAÇÃO: Adiciona updateSeller
  const navigate = useNavigate();
  const { seller, logout, updateSeller } = useAuth(); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    celular: '',
  });

  useEffect(() => {
    if (seller) {
      setFormData({
        nome: seller.nome,
        cnpj: seller.cnpj,
        email: seller.email,
        celular: seller.celular,
      });
    }
  }, [seller]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) return;

    setLoading(true);
    try {
      // 1. Chama a API de atualização
      const updatedSeller = await usersAPI.update(seller.id, formData);
      
      // 2. ➡️ ATUALIZAÇÃO: Atualiza o contexto (e localStorage) com os novos dados
      updateSeller(updatedSeller); 

      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleInactivate = async () => {
    if (!seller) return;

    setLoading(true);
    try {
      // Usa usersAPI.inactivate
      await usersAPI.inactivate(seller.id);
      toast.success('Conta inativada com sucesso');
      logout();
      navigate('/auth/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao inativar conta');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Usuário
            </CardTitle>
            <CardDescription>Atualize seus dados cadastrais</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Ações irreversíveis que afetarão sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Inativar Conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá inativar sua conta. Você precisará entrar em contato
                    com o suporte para reativá-la.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleInactivate}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirmar Inativação
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}