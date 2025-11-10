import { useQueries } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { productsAPI, salesAPI } from '@/api';
import type { Product, Sale } from '@/types';

export default function Reports() {
  // ✅ Função defensiva para converter valores para número
  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  // ✅ Função para calcular o total de uma venda com fallbacks
  const getSaleTotal = (sale: Sale): number => {
    // Tenta usar valor_total se existir e for válido
    if (sale.valor_total !== undefined && sale.valor_total !== null) {
      const total = safeNumber(sale.valor_total);
      if (total > 0) return total;
    }
    
    // Senão, calcula preco_vendido * quantidade
    const preco = safeNumber((sale as any).preco_vendido);
    const quantidade = safeNumber(sale.quantidade);
    return preco * quantidade;
  };

  const results = useQueries({
    queries: [
      { 
        queryKey: ['products'], 
        queryFn: productsAPI.getAll,
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
      { 
        queryKey: ['sales'], 
        queryFn: salesAPI.getAll,
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    ],
  });

  const productsQuery = results[0];
  const salesQuery = results[1];

  const products: Product[] = productsQuery.data || [];
  const sales: Sale[] = salesQuery.data || [];
  const loading = productsQuery.isLoading || salesQuery.isLoading;
  const isError = productsQuery.isError || salesQuery.isError;

  // ✅ Métricas gerais com proteção contra NaN
  const totalRevenue = sales.reduce((acc, s) => acc + getSaleTotal(s), 0);
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'Ativo').length;
  const totalStock = products.reduce((acc, p) => acc + safeNumber(p.quantidade), 0);

  // ✅ Produtos mais vendidos com proteção contra NaN
  const productSalesMap = new Map<
    number,
    { name: string; quantity: number; revenue: number }
  >();

  sales.forEach((sale) => {
    const product = products.find((p) => p.id === sale.produto_id);
    if (product) {
      const existing = productSalesMap.get(sale.produto_id) || {
        name: product.nome,
        quantity: 0,
        revenue: 0,
      };
      productSalesMap.set(sale.produto_id, {
        name: product.nome,
        quantity: existing.quantity + safeNumber(sale.quantidade),
        revenue: existing.revenue + getSaleTotal(sale),
      });
    }
  });

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ✅ Produtos com baixo estoque com proteção
  const lowStockProducts = products
    .filter((p) => p.status === 'Ativo' && safeNumber(p.quantidade) < 10)
    .sort((a, b) => safeNumber(a.quantidade) - safeNumber(b.quantidade))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada do seu negócio</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando relatórios...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Aguardando servidor... (pode levar até 1 minuto)
            </p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive">
            <p>Não foi possível carregar os dados. Tente novamente.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Métricas Gerais */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Métricas Gerais</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {safeNumber(totalRevenue).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Todas as vendas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                    <Package className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalProducts}</div>
                    <p className="text-xs text-muted-foreground">{activeProducts} ativos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{safeNumber(totalStock)}</div>
                    <p className="text-xs text-muted-foreground">unidades</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{sales.length}</div>
                    <p className="text-xs text-muted-foreground">transações</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Produtos Mais Vendidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Produtos Mais Vendidos
                </CardTitle>
                <CardDescription>Top 5 produtos por receita gerada</CardDescription>
              </CardHeader>
              <CardContent>
                {topProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma venda registrada ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b pb-4 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {safeNumber(product.quantity)} unidades vendidas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            R$ {safeNumber(product.revenue).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alerta de Estoque Baixo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Alerta de Estoque Baixo
                </CardTitle>
                <CardDescription>Produtos com menos de 10 unidades</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Todos os produtos têm estoque adequado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {lowStockProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{product.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {safeNumber(product.preco).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-600">
                            {safeNumber(product.quantidade)} unidades
                          </p>
                          <p className="text-xs text-muted-foreground">Estoque baixo</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}