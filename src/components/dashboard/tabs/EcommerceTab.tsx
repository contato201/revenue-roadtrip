import { useState, useMemo } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { BenchmarkingCard } from "../BenchmarkingCard";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Eye, ShoppingCart, CreditCard, Package, Target, BarChart3, Users, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const safeDivide = (a: number, b: number, fallback = 0): number => {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return fallback;
  const result = a / b;
  return Number.isFinite(result) ? result : fallback;
};

const safePercent = (value: number, percent: number, fallback = 0): number => {
  if (!Number.isFinite(value) || !Number.isFinite(percent)) return fallback;
  if (percent < 0 || percent > 100) return fallback;
  const result = value * (percent / 100);
  return Number.isFinite(result) ? Math.round(result) : fallback;
};

export function EcommerceTab() {
  // Inputs
  const [investimento, setInvestimento] = useState(5000);
  const [cpc, setCpc] = useState(1.5);
  const [taxaViewContent, setTaxaViewContent] = useState(60);
  const [taxaAddToCart, setTaxaAddToCart] = useState(12);
  const [taxaCheckout, setTaxaCheckout] = useState(45);
  const [taxaPurchase, setTaxaPurchase] = useState(65);
  const [ticketMedio, setTicketMedio] = useState(150);
  const [comprasMesCliente, setComprasMesCliente] = useState(2);

  const calculos = useMemo(() => {
    const cliques = cpc > 0 ? Math.round(safeDivide(investimento, cpc)) : 0;
    const viewContent = safePercent(cliques, taxaViewContent);
    const addToCart = safePercent(viewContent, taxaAddToCart);
    const checkouts = safePercent(addToCart, taxaCheckout);
    const compras = safePercent(checkouts, taxaPurchase);
    const faturamento = compras * ticketMedio;
    const lucro = faturamento - investimento;
    const roas = safeDivide(faturamento, investimento);
    const cpa = safeDivide(investimento, compras);
    const taxaConversaoGeral = cliques > 0 ? (compras / cliques) * 100 : 0;
    const ltv = ticketMedio * comprasMesCliente * 12;

    return { cliques, viewContent, addToCart, checkouts, compras, faturamento, lucro, roas, cpa, taxaConversaoGeral, ltv };
  }, [investimento, cpc, taxaViewContent, taxaAddToCart, taxaCheckout, taxaPurchase, ticketMedio, comprasMesCliente]);

  const { cliques, viewContent, addToCart, checkouts, compras, faturamento, lucro, roas, cpa, taxaConversaoGeral, ltv } = calculos;

  const isLucro = lucro >= 0;
  const lucroVariant = isLucro ? "success" : "danger";

  const handleBenchmarksGenerated = (benchmarks: any) => {
    if (!benchmarks) return;
    if (benchmarks.cpc && Number.isFinite(benchmarks.cpc)) setCpc(benchmarks.cpc);
    if (benchmarks.taxaViewContent && Number.isFinite(benchmarks.taxaViewContent)) setTaxaViewContent(benchmarks.taxaViewContent);
    if (benchmarks.taxaAddToCart && Number.isFinite(benchmarks.taxaAddToCart)) setTaxaAddToCart(benchmarks.taxaAddToCart);
    if (benchmarks.taxaCheckout && Number.isFinite(benchmarks.taxaCheckout)) setTaxaCheckout(benchmarks.taxaCheckout);
    if (benchmarks.taxaPurchase && Number.isFinite(benchmarks.taxaPurchase)) setTaxaPurchase(benchmarks.taxaPurchase);
    if (benchmarks.ticketMedio && Number.isFinite(benchmarks.ticketMedio)) setTicketMedio(benchmarks.ticketMedio);
  };

  return (
    <div className="space-y-6">
      <BenchmarkingCard
        tipo="ecommerce"
        onBenchmarksGenerated={handleBenchmarksGenerated}
      />

      <Card className="p-6 border-l-4 border-l-primary bg-card">
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">Como Funciona?</h3>
        <p className="text-sm text-muted-foreground">
          Simule o funil completo do seu e-commerce: do clique no anúncio até a compra. 
          Ajuste os valores para prever faturamento, ROAS, CPA e LTV em tempo real.
        </p>
      </Card>

      {/* Investimento */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 border-l-primary pl-4">
          <h3 className="text-base font-display font-semibold text-foreground">1️⃣ Investimento e Tráfego</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InputCard
            label="Investimento Total"
            value={investimento}
            onChange={setInvestimento}
            prefix="R$"
            icon={<DollarSign className="w-4 h-4" />}
            description="Quanto você pretende gastar em anúncios"
          />
          <InputCard
            label="CPC (Custo por Clique)"
            value={cpc}
            onChange={setCpc}
            prefix="R$"
            icon={<Target className="w-4 h-4" />}
            description="Custo médio por clique no anúncio"
            min={0.01}
          />
        </div>
      </div>

      {/* Funil */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 border-l-primary pl-4">
          <h3 className="text-base font-display font-semibold text-foreground">2️⃣ Funil de Conversão</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InputCard
            label="View Content"
            value={taxaViewContent}
            onChange={setTaxaViewContent}
            suffix="%"
            icon={<Eye className="w-4 h-4" />}
            description="% dos cliques que visualizam o produto"
          />
          <InputCard
            label="Add to Cart"
            value={taxaAddToCart}
            onChange={setTaxaAddToCart}
            suffix="%"
            icon={<ShoppingCart className="w-4 h-4" />}
            description="% dos views que adicionam ao carrinho"
          />
          <InputCard
            label="Checkout"
            value={taxaCheckout}
            onChange={setTaxaCheckout}
            suffix="%"
            icon={<CreditCard className="w-4 h-4" />}
            description="% que iniciam o checkout"
          />
          <InputCard
            label="Purchase"
            value={taxaPurchase}
            onChange={setTaxaPurchase}
            suffix="%"
            icon={<Package className="w-4 h-4" />}
            description="% que finalizam a compra"
          />
        </div>
      </div>

      {/* Ticket e LTV */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 border-l-primary pl-4">
          <h3 className="text-base font-display font-semibold text-foreground">3️⃣ Valor e Recorrência</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InputCard
            label="Ticket Médio"
            value={ticketMedio}
            onChange={setTicketMedio}
            prefix="R$"
            icon={<DollarSign className="w-4 h-4" />}
            description="Valor médio de cada compra"
          />
          <InputCard
            label="Compras por Mês (por cliente)"
            value={comprasMesCliente}
            onChange={setComprasMesCliente}
            icon={<RefreshCw className="w-4 h-4" />}
            description="Média de recompras mensais por cliente"
            min={1}
          />
        </div>
      </div>

      {/* Resultados - Funil */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 border-l-primary pl-4 mb-4">
          <h3 className="text-base font-display font-semibold text-foreground">4️⃣ Resultados do Funil</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <MetricCard
            label="🖱️ Cliques"
            value={cliques.toLocaleString('pt-BR')}
            description="Visitantes no site"
            variant="default"
          />
          <MetricCard
            label="👁️ View Content"
            value={viewContent.toLocaleString('pt-BR')}
            description="Visualizaram produtos"
            variant="default"
          />
          <MetricCard
            label="🛒 Add to Cart"
            value={addToCart.toLocaleString('pt-BR')}
            description="Adicionaram ao carrinho"
            variant="primary"
          />
          <MetricCard
            label="💳 Checkouts"
            value={checkouts.toLocaleString('pt-BR')}
            description="Iniciaram pagamento"
            variant="primary"
          />
          <MetricCard
            label="✅ Compras"
            value={compras.toLocaleString('pt-BR')}
            description="Finalizaram a compra"
            variant="success"
          />
        </div>

        {/* KPIs principais */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-5 border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">ROAS</p>
            </div>
            <p className={cn(
              "text-3xl font-display font-bold",
              roas >= 1 ? "text-success" : "text-destructive"
            )}>
              {roas.toFixed(2)}x
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {roas >= 1 ? "Retorno positivo" : "Retorno negativo"}
            </p>
          </Card>

          <Card className="p-5 border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">CPA</p>
            </div>
            <p className="text-3xl font-display font-bold text-primary">
              R$ {cpa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Custo por aquisição
            </p>
          </Card>

          <Card className="p-5 border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">
              R$ {ticketMedio.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Valor médio por compra
            </p>
          </Card>

          <Card className="p-5 border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <Users className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">LTV (12 meses)</p>
            </div>
            <p className="text-3xl font-display font-bold text-success">
              R$ {ltv.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime Value estimado
            </p>
          </Card>
        </div>

        {/* Taxa de conversão geral */}
        <Card className="p-6 border border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Taxa de Conversão Geral (Clique → Compra)
              </p>
              <p className="text-4xl font-display font-bold text-primary">
                {taxaConversaoGeral.toFixed(2)}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {compras > 0
                  ? `De cada 100 cliques, ${taxaConversaoGeral.toFixed(1)} se tornam compradores`
                  : "Ajuste os valores para calcular a conversão"}
              </p>
            </div>
            <div className="hidden md:block p-4 bg-primary/10 rounded-lg">
              <Target className="w-12 h-12 text-primary" />
            </div>
          </div>
        </Card>

        {/* Lucro e Resumo */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className={cn(
            "p-8 border-l-4",
            isLucro
              ? "border-l-success bg-success/5"
              : "border-l-destructive bg-destructive/5"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-lg",
                isLucro ? "bg-success/10" : "bg-destructive/10"
              )}>
                {isLucro ? (
                  <TrendingUp className="w-10 h-10 text-success" />
                ) : (
                  <TrendingDown className="w-10 h-10 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {isLucro ? "SEU LUCRO" : "SEU PREJUÍZO"}
                </p>
                <p className={cn(
                  "text-4xl font-display font-bold",
                  isLucro ? "text-success" : "text-destructive"
                )}>
                  R$ {Math.abs(lucro).toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {isLucro
                    ? `ROAS de ${roas.toFixed(2)}x sobre o investimento!`
                    : 'Ajuste os valores para ter lucro'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card border border-border">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Resumo do Funil:</p>
              <div className="space-y-2 text-sm">
                <p>✓ Você investe: <span className="font-bold">R$ {investimento.toLocaleString('pt-BR')}</span></p>
                <p>✓ Gera: <span className="font-bold">{cliques.toLocaleString('pt-BR')} cliques</span></p>
                <p>✓ View Content: <span className="font-bold">{viewContent.toLocaleString('pt-BR')}</span></p>
                <p>✓ Add to Cart: <span className="font-bold">{addToCart.toLocaleString('pt-BR')}</span></p>
                <p>✓ Compras: <span className="font-bold text-success">{compras.toLocaleString('pt-BR')}</span></p>
                <p>✓ Fatura: <span className="font-bold text-success">R$ {faturamento.toLocaleString('pt-BR')}</span></p>
                <p className="text-base font-bold pt-2 border-t">
                  = {isLucro ? "Lucro" : "Prejuízo"} de{" "}
                  <span className={isLucro ? "text-success" : "text-destructive"}>
                    R$ {Math.abs(lucro).toLocaleString('pt-BR')}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
