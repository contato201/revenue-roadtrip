import { useState, useMemo } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { BenchmarkingCard } from "../BenchmarkingCard";
import { TrendingUp, TrendingDown, DollarSign, Target, Percent, Eye, ShoppingCart } from "lucide-react";

// Função segura para divisão
const safeDivide = (a: number, b: number, fallback = 0): number => {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return fallback;
  const result = a / b;
  return Number.isFinite(result) ? result : fallback;
};

export function PerpetuoTab() {
  const [investimento, setInvestimento] = useState(5000);
  const [capaMaximo, setCapaMaximo] = useState(150);
  const [custoPageView, setCustoPageView] = useState(0.5);
  const [conversaoPagina, setConversaoPagina] = useState(2);
  const [ticket, setTicket] = useState(400);

  const calculos = useMemo(() => {
    const pageViews = custoPageView > 0 ? Math.round(safeDivide(investimento, custoPageView)) : 0;
    const vendas = conversaoPagina > 0 && conversaoPagina <= 100 
      ? Math.round(pageViews * (conversaoPagina / 100)) 
      : 0;
    const custoVenda = safeDivide(investimento, vendas);
    const faturamentoBruto = vendas * ticket;
    const lucro = faturamentoBruto - investimento;
    const roas = safeDivide(faturamentoBruto, investimento);

    return { pageViews, vendas, custoVenda, faturamentoBruto, lucro, roas };
  }, [investimento, custoPageView, conversaoPagina, ticket]);

  const { pageViews, vendas, custoVenda, faturamentoBruto, lucro, roas } = calculos;

  // Determina variante de cor para lucro
  const lucroVariant = lucro >= 0 ? "success" : "danger";

  const handleBenchmarksGenerated = (benchmarks: any) => {
    if (!benchmarks) return;
    
    const cpaMeta = benchmarks.meta?.custoAquisicaoCliente;
    const cpaGoogle = benchmarks.google?.custoAquisicaoCliente;
    const cpaMedio = cpaMeta && cpaGoogle 
      ? (cpaMeta + cpaGoogle) / 2 
      : cpaMeta || cpaGoogle;
    
    if (cpaMedio && Number.isFinite(cpaMedio)) {
      setCapaMaximo(cpaMedio);
      const custoPageViewEstimado = cpaMedio / 50;
      if (Number.isFinite(custoPageViewEstimado) && custoPageViewEstimado > 0) {
        setCustoPageView(custoPageViewEstimado);
      }
    }
  };

  return (
    <div className="space-y-6">
      <BenchmarkingCard 
        tipo="perpetuo" 
        onBenchmarksGenerated={handleBenchmarksGenerated}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InputCard
          label="Investimento"
          value={investimento}
          onChange={setInvestimento}
          prefix="R$"
          icon={<DollarSign className="w-4 h-4" />}
          description="Investimento total em anúncios"
        />
        <InputCard
          label="CPA Máximo"
          value={capaMaximo}
          onChange={setCapaMaximo}
          prefix="R$"
          icon={<Target className="w-4 h-4" />}
          description="Custo por aquisição limite aceitável"
        />
        <InputCard
          label="Custo por PageView"
          value={custoPageView}
          onChange={setCustoPageView}
          prefix="R$"
          icon={<Eye className="w-4 h-4" />}
          description="Quanto custa trazer visitas"
          min={0.01}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InputCard
          label="% Conversão Página"
          value={conversaoPagina}
          onChange={setConversaoPagina}
          suffix="%"
          icon={<Percent className="w-4 h-4" />}
          description="Taxa de visitantes que viram vendas"
        />
        <InputCard
          label="Ticket Médio"
          value={ticket}
          onChange={setTicket}
          prefix="R$"
          icon={<ShoppingCart className="w-4 h-4" />}
          description="Valor por venda"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="PageViews"
          value={pageViews.toLocaleString('pt-BR')}
          icon={<Eye className="w-5 h-5" />}
          variant="default"
          description="Visitantes na página"
        />
        <MetricCard
          label="Nº de Vendas"
          value={vendas.toLocaleString('pt-BR')}
          icon={<Target className="w-5 h-5" />}
          variant="primary"
          description="Quantas vendas foram realizadas"
        />
        <MetricCard
          label="Custo por Venda (CAC)"
          value={`R$ ${custoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          variant={vendas > 0 && custoVenda <= capaMaximo ? "success" : "warning"}
          description={vendas > 0 ? (custoVenda <= capaMaximo ? "Dentro do CPA máximo" : "Acima do CPA máximo") : "Sem vendas"}
        />
        <MetricCard
          label="Retorno em Vendas"
          value={`R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
          description="Faturamento bruto"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="ROAS"
          value={roas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          description={`R$ ${roas.toFixed(2)} retornados por R$ 1 investido`}
          variant={roas > 3 ? "success" : roas > 1.5 ? "primary" : "warning"}
        />
        <MetricCard
          label={lucro >= 0 ? "Lucro Bruto" : "Prejuízo"}
          value={`R$ ${Math.abs(lucro).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={lucro >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          variant={lucroVariant}
        />
        <MetricCard
          label="Investimento Total"
          value={`R$ ${investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="default"
          description="Valor investido em anúncios"
        />
      </div>
    </div>
  );
}
