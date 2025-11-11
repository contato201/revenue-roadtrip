import { useState } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { BenchmarkingCard } from "../BenchmarkingCard";
import { TrendingUp, DollarSign, Target, Percent, MessageSquare, Calendar } from "lucide-react";

export function PerpetuoTab() {
  const [investimento, setInvestimento] = useState(5000);
  const [custoMensagem, setCustoMensagem] = useState(0.9);
  const [taxaConversao, setTaxaConversao] = useState(1);
  const [ticket, setTicket] = useState(400);

  // Cálculos
  const mensagensEnviadas = Math.round(investimento / custoMensagem);
  const conversoes = Math.round(mensagensEnviadas * (taxaConversao / 100));
  const faturamentoBruto = conversoes * ticket;
  const lucro = faturamentoBruto - investimento;
  const roas = investimento > 0 ? faturamentoBruto / investimento : 0;
  const custoConversao = conversoes > 0 ? investimento / conversoes : 0;

  const handleBenchmarksGenerated = (benchmarks: any) => {
    if (benchmarks.custoMensagem) setCustoMensagem(benchmarks.custoMensagem);
    if (benchmarks.taxaConversao) setTaxaConversao(benchmarks.taxaConversao);
    if (benchmarks.ticket) setTicket(benchmarks.ticket);
  };

  return (
    <div className="space-y-6">
      {/* Benchmarking */}
      <BenchmarkingCard 
        tipo="perpetuo" 
        onBenchmarksGenerated={handleBenchmarksGenerated}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InputCard
          label="Investimento Mensal"
          value={investimento}
          onChange={setInvestimento}
          prefix="R$"
          icon={<DollarSign className="w-4 h-4" />}
          description="Investimento mensal em tráfego"
        />
        <InputCard
          label="Custo por Mensagem"
          value={custoMensagem}
          onChange={setCustoMensagem}
          prefix="R$"
          step={0.1}
          icon={<MessageSquare className="w-4 h-4" />}
          description="Custo para enviar cada mensagem"
        />
        <InputCard
          label="Taxa de Conversão"
          value={taxaConversao}
          onChange={setTaxaConversao}
          suffix="%"
          step={0.1}
          icon={<Percent className="w-4 h-4" />}
          description="% de mensagens que convertem"
        />
        <InputCard
          label="Ticket Médio"
          value={ticket}
          onChange={setTicket}
          prefix="R$"
          icon={<Target className="w-4 h-4" />}
          description="Valor do produto/serviço"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Mensagens Enviadas"
          value={mensagensEnviadas.toLocaleString('pt-BR')}
          icon={<MessageSquare className="w-5 h-5" />}
          variant="default"
        />
        <MetricCard
          label="Conversões"
          value={conversoes}
          icon={<Target className="w-5 h-5" />}
          variant="primary"
        />
        <MetricCard
          label="Custo por Conversão"
          value={`R$ ${custoConversao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          variant="default"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Faturamento Bruto"
          value={`R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
        />
        <MetricCard
          label="Lucro"
          value={`R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant={lucro > 0 ? "success" : "warning"}
        />
        <MetricCard
          label="ROAS"
          value={roas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          description={`Para cada R$ 1 investido, retorna R$ ${roas.toFixed(2)}`}
          icon={<Calendar className="w-5 h-5" />}
          variant={roas > 3 ? "success" : roas > 1.5 ? "primary" : "warning"}
        />
      </div>
    </div>
  );
}
