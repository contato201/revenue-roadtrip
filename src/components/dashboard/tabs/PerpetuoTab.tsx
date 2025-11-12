import { useState } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { BenchmarkingCard } from "../BenchmarkingCard";
import { TrendingUp, DollarSign, Target, Percent, Eye, ShoppingCart } from "lucide-react";

export function PerpetuoTab() {
  const [investimento, setInvestimento] = useState(5000);
  const [capaMaximo, setCapaMaximo] = useState(150);
  const [custoPageView, setCustoPageView] = useState(0.5);
  const [conversaoPagina, setConversaoPagina] = useState(2);
  const [ticket, setTicket] = useState(400);

  // Cálculos com validações rigorosas
  const pageViews = (investimento > 0 && custoPageView > 0) 
    ? Math.round(investimento / custoPageView) 
    : 0;
  
  const vendas = (pageViews > 0 && conversaoPagina > 0 && conversaoPagina <= 100) 
    ? Math.round(pageViews * (conversaoPagina / 100)) 
    : 0;
  
  const custoVenda = (vendas > 0) 
    ? investimento / vendas 
    : 0;
  
  const faturamentoBruto = (vendas > 0 && ticket > 0) 
    ? vendas * ticket 
    : 0;
  
  const lucro = faturamentoBruto - investimento;
  
  const roas = (investimento > 0 && faturamentoBruto >= 0) 
    ? faturamentoBruto / investimento 
    : 0;
  
  console.log("[Perpetuo] Cálculos detalhados:", { 
    inputs: { 
      investimento, 
      capaMaximo, 
      custoPageView, 
      conversaoPagina, 
      ticket 
    },
    resultados: {
      pageViews, 
      vendas, 
      custoVenda: custoVenda.toFixed(2), 
      faturamentoBruto, 
      lucro, 
      roas: roas.toFixed(2)
    },
    validacoes: {
      pageViewsOk: investimento > 0 && custoPageView > 0,
      vendasOk: pageViews > 0 && conversaoPagina > 0 && conversaoPagina <= 100,
      faturamentoOk: vendas > 0 && ticket > 0,
      cacDentroDoCPA: vendas > 0 ? custoVenda <= capaMaximo : false
    }
  });

  const handleBenchmarksGenerated = (benchmarks: any) => {
    console.log("[Perpetuo] Benchmarks recebidos:", benchmarks);
    
    // Usa média do CPA entre Meta e Google como referência para custo de aquisição
    const cpaMeta = benchmarks.meta?.custoAquisicaoCliente;
    const cpaGoogle = benchmarks.google?.custoAquisicaoCliente;
    const cpaMedio = cpaMeta && cpaGoogle 
      ? (cpaMeta + cpaGoogle) / 2 
      : cpaMeta || cpaGoogle;
    
    if (cpaMedio) {
      console.log("[Perpetuo] Aplicando CPA máximo:", cpaMedio);
      setCapaMaximo(cpaMedio);
      
      // Estima custo por pageview baseado no CPA e taxa de conversão típica
      // Assumindo conversão de 2%, cada venda precisa de ~50 pageviews
      // Então custo/pageview = CPA / 50
      const custoPageViewEstimado = cpaMedio / 50;
      console.log("[Perpetuo] Estimando custo por pageview:", custoPageViewEstimado);
      setCustoPageView(custoPageViewEstimado);
    }
    
    // Benchmarks de perpétuo não fornecem ticket ou taxa de conversão específica
    // Mantém os valores padrão
  };

  return (
    <div className="space-y-6">
      {/* Benchmarking */}
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
          step={1}
          icon={<Target className="w-4 h-4" />}
          description="Custo por aquisição limite aceitável"
        />
        <InputCard
          label="Custo por PageView"
          value={custoPageView}
          onChange={setCustoPageView}
          prefix="R$"
          step={0.01}
          icon={<Eye className="w-4 h-4" />}
          description="Quanto custa trazer visitas"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InputCard
          label="% Conversão Página"
          value={conversaoPagina}
          onChange={setConversaoPagina}
          suffix="%"
          step={0.1}
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
          value={vendas}
          icon={<Target className="w-5 h-5" />}
          variant="primary"
          description="Quantas vendas foram realizadas"
        />
        <MetricCard
          label="Custo por Venda (CAC)"
          value={`R$ ${custoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          variant={custoVenda <= capaMaximo ? "success" : "warning"}
          description={custoVenda <= capaMaximo ? "Dentro do CPA máximo" : "Acima do CPA máximo"}
        />
        <MetricCard
          label="Retorno em Vendas"
          value={`R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
          description="Faturamento bruto"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="ROAS"
          value={roas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          description={`Faturamento ÷ Investimento = R$ ${roas.toFixed(2)}`}
          variant={roas > 3 ? "success" : roas > 1.5 ? "primary" : "warning"}
        />
        <MetricCard
          label="Lucro Bruto (sem custos fixos)"
          value={`R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant={lucro > 0 ? "success" : "warning"}
        />
        <MetricCard
          label="Investimento Total"
          value={`R$ ${investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="default"
          description="Valor investido em anúncios"
        />
      </div>
    </div>
  );
}
