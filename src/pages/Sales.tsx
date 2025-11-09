import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// TODO: INTEGRAÇÃO - Trocar para @/services/api quando conectar ao backend real
import { mockProductsAPI as productsAPI, mockSalesAPI as salesAPI } from '@/mocks/mockApi';
import { toast } from 'sonner';
import type { Product, Sale } from '@/types';

export default function Sales() {
  const queryClient = useQueryClient(); // 🎣 Hook para interagir com o cache
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    produto_id: '',
    quantidade: '',
  });

  // 🚀 Usando useQueries para carregar vendas e produtos em paralelo
  const results = useQueries({
    queries: [
      { queryKey: ['sales'], queryFn: salesAPI.getAll },
      { queryKey: ['products'], queryFn: productsAPI.getAll },
    ],
  });

  const salesQuery = results[0];
  const productsQuery = results[1];

  const sales: Sale[] = salesQuery.data || [];
  const allProducts: Product[] = productsQuery.data || [];
  const products = allProducts.filter((p) => p.status === 'Ativo'); // Filtra apenas ativos
  const loading = salesQuery.isLoading || productsQuery.isLoading;
  const isError = salesQuery.isError || productsQuery.isError;

  // 🔄 UseMutation para registrar a venda
  const saleMutation = useMutation({
    mutationFn: salesAPI.create,
    onSuccess: () => {
      toast.success('Venda registrada com sucesso!');
      setDialogOpen(false);
      setFormData({ produto_id: '', quantidade: '' });
      
      // ♻️ Invalida as queries de vendas e produtos para forçar um recarregamento
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao registrar venda');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const saleData = {
      produto_id: parseInt(formData.produto_id),
      quantidade: parseInt(formData.quantidade),
    };
    
    // 🚀 Chama a mutação
    saleMutation.mutate(saleData);
  };

  const getProductName = (productId: number) => {
    const product = allProducts.find((p) => p.id === productId);
    return product?.nome || `Produto #${productId}`;
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Vendas</h1>
            <p className="text-muted-foreground">Registre e acompanhe suas vendas</p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                // Limpa o formulário ao fechar o diálogo
                setFormData({ produto_id: '', quantidade: '' });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Venda</DialogTitle>
                <DialogDescription>
                  Selecione o produto e a quantidade vendida
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="produto_id">Produto</Label>
                  <Select
                    value={formData.produto_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, produto_id: value })
                    }
                    disabled={saleMutation.isPending || productsQuery.isLoading}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                            productsQuery.isLoading ? "Carregando produtos..." : "Selecione um produto"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.nome} - R$ {product.preco.toFixed(2)} (Estoque:{' '}
                          {product.quantidade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    name="quantidade"
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) =>
                      setFormData({ ...formData, quantidade: e.target.value })
                    }
                    disabled={saleMutation.isPending}
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={saleMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saleMutation.isPending}>
                    {saleMutation.isPending ? 'Registrando...' : 'Registrar Venda'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando vendas...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive">
            <p>Não foi possível carregar o histórico de vendas. Tente novamente.</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>Todas as transações realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nenhuma venda registrada ainda</p>
                  <Button onClick={() => setDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Registrar Primeira Venda
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{getProductName(sale.produto_id)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-accent">
                          R$ {sale.valor_total.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sale.quantidade} {sale.quantidade === 1 ? 'unidade' : 'unidades'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}