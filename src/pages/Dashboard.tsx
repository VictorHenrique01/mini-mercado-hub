import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { productsAPI, salesAPI } from '@/api';
import type { Product, Sale } from '@/types';

export default function Dashboard() {
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
    retry: 3, // ✅ Tentar 3 vezes antes de falhar
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // ✅ Backoff exponencial
    staleTime: 5 * 60 * 1000, // ✅ 5 minutos - evita refetch desnecessário
    refetchOnWindowFocus: false, // ✅ Não refazer ao trocar de aba
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: salesAPI.getAll,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const loading = productsLoading || salesLoading;
  const products: Product[] = Array.isArray(productsData) ? productsData : [];
  const sales: Sale[] = Array.isArray(salesData) ? salesData : [];

  // utilitário: formata valores monetários de forma segura
  const safeNumber = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const formatMoney = (v: unknown) => {
    const n = safeNumber(v);
    return n.toFixed(2);
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
  };

  // calcula o total de cada venda de forma defensiva:
  const getSaleTotal = (s: Sale) => {
    // backend pode devolver valor_total
    if (s && (s as any).valor_total !== undefined && (s as any).valor_total !== null) {
      const n = Number((s as any).valor_total);
      if (Number.isFinite(n)) return n;
    }

    // fallback: preco_vendido * quantidade
    const preco = safeNumber((s as any).preco_vendido);
    const qtd = safeNumber(s?.quantidade);
    return preco * qtd;
  };

  // Produtos ativos: case-insensitive
  const activeProducts = products.filter((p) => {
    const s = (p?.status || '').toString().trim().toLowerCase();
    return s === 'ativo';
  }).length;

  // Estoque total (seguro)
  const totalStock = products.reduce((acc, p) => {
    const q = safeNumber((p as any).quantidade);
    return acc + q;
  }, 0);

  // Total de vendas
  const totalSales = sales.length;

  // Receita total (soma defensiva)
  const totalRevenue = sales.reduce((acc, s) => {
    return acc + getSaleTotal(s);
  }, 0);

  const recentSales = Array.isArray(sales) ? sales.slice(0, 5) : [];

  // pegar nome do produto se disponível no objeto sale.produto ou via products list
  const getProductName = (sale: Sale) => {
    const prodFromSale = (sale as any).produto;
    if (prodFromSale && prodFromSale.nome) return prodFromSale.nome;
    const prod = products.find((p) => p.id === (sale as any).produto_id);
    return prod?.nome || `Produto #${(sale as any).produto_id ?? '?'}`;
  };

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
            <p className="text-xs text-muted-foreground mt-2">
              Se o servidor estiver hibernando, pode levar até 1 minuto
            </p>
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
                    R$ {formatMoney(totalRevenue)}
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
                          <p className="font-medium">{getProductName(sale)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate((sale as any).created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {formatMoney(getSaleTotal(sale))}</p>
                          <p className="text-sm text-muted-foreground">
                            {safeNumber((sale as any).quantidade)} {safeNumber((sale as any).quantidade) === 1 ? 'unidade' : 'unidades'}
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
