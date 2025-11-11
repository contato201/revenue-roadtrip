import { useState } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { BenchmarkingCard } from "../BenchmarkingCard";
import { TrendingUp, DollarSign, Target, Percent, MousePointerClick } from "lucide-react";

export function LancamentoTab() {
  // Inputs principais
  const [investimentoTotal, setInvestimentoTotal] = useState(1000);
  const [custoLead, setCustoLead] = useState(30);
  const [taxaConversao, setTaxaConversao] = useState(1.2); // Representa % diretamente (ex: 1.2 = 1.2%)
  const [ticket, setTicket] = useState(997);
  
  // Percentual de captação
  const [percentualCaptacao, setPercentualCaptacao] = useState(70);
  
  // Fatores que afetam o CPL (editáveis)
  const [ctr, setCtr] = useState(2.5);
  const [conversaoPagina, setConversaoPagina] = useState(15);

  // Cálculos de investimento
  const investimentoCaptacao = investimentoTotal * (percentualCaptacao / 100);
  const investimentoOutros = investimentoTotal - investimentoCaptacao;

  // Cálculos de leads e vendas
  const numeroLeads = Math.round(investimentoTotal / custoLead);
  const numeroVendas = Math.round(numeroLeads * (taxaConversao / 100));
  
  // Cálculos financeiros
  const faturamentoBruto = numeroVendas * ticket;
  const lucroBruto = faturamentoBruto - investimentoTotal;
  const roas = investimentoTotal > 0 ? faturamentoBruto / investimentoTotal : 0;

  // Cálculo de CPL estimado baseado em CTR e conversão da página
  const cplEstimado = custoLead * (1 / (ctr / 100)) * (1 / (conversaoPagina / 100));

  const handleBenchmarksGenerated = (benchmarks: any) => {
    if (benchmarks.custoLead) setCustoLead(benchmarks.custoLead);
    if (benchmarks.ticket) setTicket(benchmarks.ticket);
    if (benchmarks.meta?.ctr) setCtr(benchmarks.meta.ctr);
  };

  return (
    <div className="space-y-6">
      {/* Benchmarking */}
      <BenchmarkingCard 
        tipo="lancamento" 
        onBenchmarksGenerated={handleBenchmarksGenerated}
      />

      {/* Inputs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InputCard
          label="Investimento Total"
          value={investimentoTotal}
          onChange={setInvestimentoTotal}
          prefix="R$"
          icon={<DollarSign className="w-4 h-4" />}
          description="Valor total do investimento"
        />
        <InputCard
          label="CPL médio"
          value={custoLead}
          onChange={setCustoLead}
          prefix="R$"
          step={0.5}
          icon={<Target className="w-4 h-4" />}
          description="Custo por lead"
        />
        <InputCard
          label="Taxa de Conversão"
          value={taxaConversao}
          onChange={setTaxaConversao}
          suffix="%"
          step={0.1}
          icon={<Percent className="w-4 h-4" />}
          description="% de leads que convertem em vendas (ex: 1.2%)"
        />
        <InputCard
          label="Ticket Médio"
          value={ticket}
          onChange={setTicket}
          prefix="R$"
          icon={<DollarSign className="w-4 h-4" />}
          description="Valor do produto/serviço"
        />
      </div>

      {/* Distribuição de Investimento */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h3 className="text-lg font-display font-bold mb-4 text-foreground">Distribuição do Investimento</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <InputCard
            label="% para Captação"
            value={percentualCaptacao}
            onChange={setPercentualCaptacao}
            suffix="%"
            step={1}
            icon={<Percent className="w-4 h-4" />}
            description="Quanto vai para captação de leads"
          />
          <MetricCard
            label="Investimento em Captação"
            value={`R$ ${investimentoCaptacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            variant="primary"
            description={`${percentualCaptacao}% do investimento total`}
          />
          <MetricCard
            label="Outros Investimentos"
            value={`R$ ${investimentoOutros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            variant="default"
            description={`${(100 - percentualCaptacao)}% do investimento total`}
          />
        </div>
      </div>

      {/* Fatores que Afetam o CPL */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h3 className="text-lg font-display font-bold mb-4 text-foreground">
          Fatores que Afetam o Custo por Lead
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ajuste CTR e taxa de conversão da página para ver como impactam o CPL estimado
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <InputCard
            label="CTR (Taxa de Clique)"
            value={ctr}
            onChange={setCtr}
            suffix="%"
            step={0.1}
            icon={<MousePointerClick className="w-4 h-4" />}
            description="% de pessoas que clicam"
          />
          <InputCard
            label="Conversão da Página"
            value={conversaoPagina}
            onChange={setConversaoPagina}
            suffix="%"
            step={0.5}
            icon={<Percent className="w-4 h-4" />}
            description="% que convertem na landing page"
          />
          <MetricCard
            label="CPL Estimado com Ajustes"
            value={`R$ ${cplEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            variant={cplEstimado < custoLead ? "success" : "warning"}
            description="Baseado em CTR e conversão"
          />
        </div>
      </div>

      {/* Resultados de Leads e Vendas */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Número de Leads"
          value={numeroLeads.toLocaleString('pt-BR')}
          icon={<Target className="w-5 h-5" />}
          variant="primary"
          description="Total de leads gerados"
        />
        <MetricCard
          label="Número de Vendas"
          value={numeroVendas.toLocaleString('pt-BR')}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="primary"
          description={`Com taxa de conversão de ${taxaConversao}%`}
        />
      </div>

      {/* Resultados Financeiros */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Faturamento Bruto"
          value={`R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
          description="Receita total prevista"
        />
        <MetricCard
          label="Lucro Bruto"
          value={`R$ ${lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant={lucroBruto > 0 ? "success" : "warning"}
          description="Faturamento - Investimento"
        />
        <MetricCard
          label="ROAS"
          value={roas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          variant={roas > 3 ? "success" : roas > 1.5 ? "primary" : "warning"}
          description={`R$ ${roas.toFixed(2)} retornados por R$ 1 investido`}
        />
      </div>
    </div>
  );
}
