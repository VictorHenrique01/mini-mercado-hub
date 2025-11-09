import { useEffect, useState } from 'react';
import { Plus, Edit, Eye, Power } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
// 🚀 INTEGRAÇÃO: Usando API real
import { productsAPI } from '@/services/api';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    quantidade: '',
    imagem_url: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      nome: formData.nome,
      preco: parseFloat(formData.preco),
      quantidade: parseInt(formData.quantidade),
      imagem_url: formData.imagem_url || undefined,
      status: 'Ativo' as const,
    };

    try {
      if (editingProduct) {
        // Usa productsAPI.update
        await productsAPI.update(editingProduct.id, productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Usa productsAPI.create
        await productsAPI.create(productData);
        toast.success('Produto criado com sucesso!');
      }
      setDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar produto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nome: product.nome,
      preco: product.preco.toString(),
      quantidade: product.quantidade.toString(),
      imagem_url: product.imagem_url || '',
    });
    setDialogOpen(true);
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      // 🚀 INTEGRAÇÃO: Usa productsAPI.inactivate ou productsAPI.update para alterar o status
      const newStatus = product.status === 'Ativo' ? 'Inativo' : 'Ativo';
      // Preferimos usar a rota PATCH /inactivate ou PUT/PATCH update, dependendo da sua API.
      // Vou usar a rota PATCH inactivate que você adicionou no seu serviço para Inativar.
      // Para reativar, vamos assumir que você usa o update geral.

      if (newStatus === 'Inativo') {
          await productsAPI.inactivate(product.id);
      } else {
          await productsAPI.update(product.id, { status: newStatus });
      }

      toast.success(`Produto ${newStatus === 'Ativo' ? 'ativado' : 'inativado'}`);
      loadProducts();
    } catch (error) {
      toast.error('Erro ao alterar status do produto');
    }
  };

  const resetForm = () => {
    setFormData({ nome: '', preco: '', quantidade: '', imagem_url: '' });
    setEditingProduct(null);
  };

  const openNewProductDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Produtos</h1>
            <p className="text-muted-foreground">Gerencie seu estoque de produtos</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewProductDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do produto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      name="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      name="quantidade"
                      type="number"
                      value={formData.quantidade}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagem_url">URL da Imagem (opcional)</Label>
                  <Input
                    id="imagem_url"
                    name="imagem_url"
                    type="url"
                    value={formData.imagem_url}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhum produto cadastrado ainda</p>
              <Button onClick={openNewProductDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar Primeiro Produto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.nome}</CardTitle>
                    <Badge variant={product.status === 'Ativo' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-2xl font-bold text-primary">
                      R$ {product.preco.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Estoque: {product.quantidade} unidades
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={product.status === 'Ativo' ? 'destructive' : 'default'}
                      onClick={() => handleToggleStatus(product)}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}