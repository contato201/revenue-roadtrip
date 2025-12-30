import { useState, useMemo } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { BenchmarkingCard } from "../BenchmarkingCard";
import { TrendingUp, DollarSign, Target, Percent, MousePointerClick } from "lucide-react";

// Função segura para divisão
const safeDivide = (a: number, b: number, fallback = 0): number => {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return fallback;
  const result = a / b;
  return Number.isFinite(result) ? result : fallback;
};

export function LancamentoTab() {
  const [investimentoTotal, setInvestimentoTotal] = useState(1000);
  const [cplBase, setCplBase] = useState(30);
  const [taxaConversao, setTaxaConversao] = useState(1.2);
  const [ticket, setTicket] = useState(997);
  const [percentualCaptacao, setPercentualCaptacao] = useState(70);
  const [ctr, setCtr] = useState(2.5);
  const [conversaoPagina, setConversaoPagina] = useState(100);

  const calculos = useMemo(() => {
    // Referências para o impacto no CPL
    const ctrReferencia = 2.5;
    const conversaoReferencia = 100;
    
    // CPL ajustado baseado nos fatores (protege contra divisão por zero)
    const fatorCtr = ctr > 0 ? safeDivide(ctrReferencia, ctr, 1) : 1;
    const fatorConversao = conversaoPagina > 0 ? safeDivide(conversaoReferencia, conversaoPagina, 1) : 1;
    const custoLead = cplBase * fatorCtr * fatorConversao;

    // Investimento em captação
    const investimentoCaptacao = investimentoTotal * (Math.min(100, Math.max(0, percentualCaptacao)) / 100);
    const investimentoOutros = investimentoTotal - investimentoCaptacao;

    // Cálculos de leads e vendas
    const numeroLeads = custoLead > 0 ? Math.round(safeDivide(investimentoCaptacao, custoLead)) : 0;
    const numeroVendas = taxaConversao > 0 && taxaConversao <= 100 
      ? Math.round(numeroLeads * (taxaConversao / 100)) 
      : 0;

    // Cálculos financeiros
    const faturamentoBruto = numeroVendas * ticket;
    const lucroBruto = faturamentoBruto - investimentoTotal;
    const roas = safeDivide(faturamentoBruto, investimentoTotal);

    return {
      custoLead,
      investimentoCaptacao,
      investimentoOutros,
      numeroLeads,
      numeroVendas,
      faturamentoBruto,
      lucroBruto,
      roas
    };
  }, [investimentoTotal, cplBase, taxaConversao, ticket, percentualCaptacao, ctr, conversaoPagina]);

  const { custoLead, investimentoCaptacao, investimentoOutros, numeroLeads, numeroVendas, faturamentoBruto, lucroBruto, roas } = calculos;

  const handleBenchmarksGenerated = (benchmarks: any) => {
    if (!benchmarks) return;
    
    const custoLeadMeta = benchmarks.meta?.custoLead;
    const custoLeadGoogle = benchmarks.google?.custoLead;
    const custoLeadMedio = custoLeadMeta && custoLeadGoogle 
      ? (custoLeadMeta + custoLeadGoogle) / 2 
      : custoLeadMeta || custoLeadGoogle;
    
    if (custoLeadMedio && Number.isFinite(custoLeadMedio)) {
      setCplBase(custoLeadMedio);
    }
    
    if (benchmarks.meta?.ctr && Number.isFinite(benchmarks.meta.ctr)) {
      setCtr(benchmarks.meta.ctr);
    }
  };

  return (
    <div className="space-y-6">
      <BenchmarkingCard 
        tipo="lancamento" 
        onBenchmarksGenerated={handleBenchmarksGenerated}
      />

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
          label="CPL Base de Referência"
          value={cplBase}
          onChange={setCplBase}
          prefix="R$"
          icon={<Target className="w-4 h-4" />}
          description="CPL inicial sem otimizações"
          min={0.01}
        />
        <InputCard
          label="Taxa de Conversão"
          value={taxaConversao}
          onChange={setTaxaConversao}
          suffix="%"
          icon={<Percent className="w-4 h-4" />}
          description="% de leads que convertem em vendas"
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

      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h3 className="text-lg font-display font-bold mb-4 text-foreground">Distribuição do Investimento</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <InputCard
            label="% para Captação"
            value={percentualCaptacao}
            onChange={setPercentualCaptacao}
            suffix="%"
            icon={<Percent className="w-4 h-4" />}
            description="Quanto vai para captação de leads"
          />
          <MetricCard
            label="Investimento em Captação"
            value={`R$ ${investimentoCaptacao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            variant="primary"
            description={`${percentualCaptacao}% do investimento total`}
          />
          <MetricCard
            label="Outros Investimentos"
            value={`R$ ${investimentoOutros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            variant="default"
            description={`${(100 - percentualCaptacao).toFixed(0)}% do investimento total`}
          />
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h3 className="text-lg font-display font-bold mb-4 text-foreground">
          Como CTR e Conversão Afetam o CPL
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ajuste CTR e conversão da página para ver o impacto direto no custo por lead
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <InputCard
            label="CTR (Taxa de Clique)"
            value={ctr}
            onChange={setCtr}
            suffix="%"
            icon={<MousePointerClick className="w-4 h-4" />}
            description="↑ CTR = ↓ CPL (mais cliques por impressão)"
            min={0.01}
          />
          <InputCard
            label="Conversão da Página"
            value={conversaoPagina}
            onChange={setConversaoPagina}
            suffix="%"
            icon={<Percent className="w-4 h-4" />}
            description="100% = referência; abaixo ↑ CPL, acima ↓ CPL"
            min={1}
          />
          <MetricCard
            label="CPL Real Ajustado"
            value={`R$ ${custoLead.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            variant={custoLead < cplBase ? "success" : custoLead > cplBase ? "warning" : "default"}
            description={
              custoLead < cplBase 
                ? `${(((cplBase - custoLead) / cplBase) * 100).toFixed(1)}% menor que o base` 
                : custoLead > cplBase 
                  ? `${(((custoLead - cplBase) / cplBase) * 100).toFixed(1)}% maior que o base` 
                  : "Igual ao base"
            }
          />
        </div>
      </div>

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

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Faturamento Bruto"
          value={`R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
          description="Receita total prevista"
        />
        <MetricCard
          label="Lucro Bruto"
          value={`R$ ${lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant={lucroBruto > 0 ? "success" : "warning"}
          description="Faturamento - Investimento"
        />
        <MetricCard
          label="ROAS"
          value={roas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          variant={roas > 3 ? "success" : roas > 1.5 ? "primary" : "warning"}
          description={`R$ ${roas.toFixed(2)} retornados por R$ 1 investido`}
        />
      </div>
    </div>
  );
}
