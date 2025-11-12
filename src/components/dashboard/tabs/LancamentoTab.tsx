import { useState } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { BenchmarkingCard } from "../BenchmarkingCard";
import { TrendingUp, DollarSign, Target, Percent, MousePointerClick } from "lucide-react";

export function LancamentoTab() {
  // Inputs principais
  const [investimentoTotal, setInvestimentoTotal] = useState(1000);
  const [cplBase, setCplBase] = useState(30); // CPL de referência
  const [taxaConversao, setTaxaConversao] = useState(1.2); // Representa % diretamente (ex: 1.2 = 1.2%)
  const [ticket, setTicket] = useState(997);
  
  // Percentual de captação
  const [percentualCaptacao, setPercentualCaptacao] = useState(70);
  
  // Fatores que afetam o CPL (editáveis)
  const [ctr, setCtr] = useState(2.5);
  const [conversaoPagina, setConversaoPagina] = useState(100);

  // Referências para o impacto no CPL (100% de performance)
  const ctrReferencia = 2.5; // CTR de referência (100% de performance)
  const conversaoReferencia = 100; // 100% = referência correta
  
  // CPL ajustado baseado nos fatores
  // Quando CTR e conversão estão na referência, CPL = cplBase
  // Abaixo da referência, CPL aumenta (pior performance)
  // Acima da referência, CPL diminui (melhor performance)
  const fatorCtr = ctrReferencia / ctr;
  const fatorConversao = conversaoReferencia / conversaoPagina;
  const custoLead = cplBase * fatorCtr * fatorConversao;
  
  console.log("[Lancamento] Cálculo CPL:", { 
    cplBase, 
    ctr, 
    conversaoPagina, 
    fatorCtr: fatorCtr.toFixed(2), 
    fatorConversao: fatorConversao.toFixed(2), 
    custoLead: custoLead.toFixed(2) 
  });

  // Cálculos de investimento com validação
  const investimentoCaptacao = investimentoTotal * (percentualCaptacao / 100);
  const investimentoOutros = investimentoTotal - investimentoCaptacao;

  // Cálculos de leads e vendas com validações
  const numeroLeads = investimentoCaptacao > 0 && custoLead > 0 
    ? Math.round(investimentoCaptacao / custoLead) 
    : 0;
  const numeroVendas = numeroLeads > 0 && taxaConversao > 0 
    ? Math.round(numeroLeads * (taxaConversao / 100)) 
    : 0;
  
  // Cálculos financeiros com validações
  const faturamentoBruto = numeroVendas > 0 && ticket > 0 
    ? numeroVendas * ticket 
    : 0;
  const lucroBruto = faturamentoBruto - investimentoTotal;
  const roas = investimentoTotal > 0 
    ? faturamentoBruto / investimentoTotal 
    : 0;
  
  console.log("[Lancamento] Resultados:", { 
    investimentoTotal, 
    custoLead: custoLead.toFixed(2), 
    numeroLeads, 
    numeroVendas, 
    faturamentoBruto, 
    lucroBruto, 
    roas: roas.toFixed(2) 
  });

  const handleBenchmarksGenerated = (benchmarks: any) => {
    console.log("[Lancamento] Benchmarks recebidos:", benchmarks);
    
    // Usa média entre Meta e Google para CPL, ou pega o que estiver disponível
    const custoLeadMeta = benchmarks.meta?.custoLead;
    const custoLeadGoogle = benchmarks.google?.custoLead;
    const custoLeadMedio = custoLeadMeta && custoLeadGoogle 
      ? (custoLeadMeta + custoLeadGoogle) / 2 
      : custoLeadMeta || custoLeadGoogle;
    
    if (custoLeadMedio) {
      console.log("[Lancamento] Aplicando CPL base:", custoLeadMedio);
      setCplBase(custoLeadMedio);
    }
    
    // CTR: usa o do Meta (geralmente mais relevante para lançamentos)
    if (benchmarks.meta?.ctr) {
      console.log("[Lancamento] Aplicando CTR:", benchmarks.meta.ctr);
      setCtr(benchmarks.meta.ctr);
    }
    
    // Ticket não vem dos benchmarks de lançamento, então não atualiza
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
          label="CPL Base de Referência"
          value={cplBase}
          onChange={setCplBase}
          prefix="R$"
          step={0.5}
          icon={<Target className="w-4 h-4" />}
          description="CPL inicial sem otimizações"
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
            step={0.1}
            icon={<MousePointerClick className="w-4 h-4" />}
            description="↑ CTR = ↓ CPL (mais cliques por impressão)"
          />
          <InputCard
            label="Conversão da Página (Performance)"
            value={conversaoPagina}
            onChange={setConversaoPagina}
            suffix="%"
            step={1}
            icon={<Percent className="w-4 h-4" />}
            description="100% = referência; abaixo ↑ CPL, acima ↓ CPL"
          />
          <MetricCard
            label="CPL Real Ajustado"
            value={`R$ ${custoLead.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            variant={custoLead < cplBase ? "success" : custoLead > cplBase ? "warning" : "default"}
            description={custoLead < cplBase ? `${(((cplBase - custoLead) / cplBase) * 100).toFixed(1)}% menor que o base` : custoLead > cplBase ? `${(((custoLead - cplBase) / cplBase) * 100).toFixed(1)}% maior que o base` : "Igual ao base"}
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
