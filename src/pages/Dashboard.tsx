import { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// 🚀 INTEGRAÇÃO: Usando API real
import { productsAPI, salesAPI } from '@/services/api';
import type { Product, Sale } from '@/types';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [productsData, salesData] = await Promise.all([
        productsAPI.getAll(),
        salesAPI.getAll(),
      ]);
      setProducts(productsData);
      setSales(salesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeProducts = products.filter((p) => p.status === 'Ativo').length;
  const totalStock = products.reduce((acc, p) => acc + p.quantidade, 0);
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.valor_total, 0);

  const recentSales = sales.slice(0, 5);

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    {products.length} produtos no total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStock}</div>
                  <p className="text-xs text-muted-foreground">unidades</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSales}</div>
                  <p className="text-xs text-muted-foreground">transações realizadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {totalRevenue.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">em vendas totais</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
                <CardDescription>Últimas 5 transações realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSales.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma venda registrada ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0"
                      >
                        <div>
                          <p className="font-medium">Produto #{sale.produto_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {sale.valor_total.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {sale.quantidade} unidades
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}