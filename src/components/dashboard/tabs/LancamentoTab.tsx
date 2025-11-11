import { useState } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { BenchmarkingCard } from "../BenchmarkingCard";
import { TrendingUp, DollarSign, Target, Percent, Users, MousePointerClick, ShoppingCart } from "lucide-react";

export function LancamentoTab() {
  const [investimentoTotal, setInvestimentoTotal] = useState(10500);
  const [ctr, setCtr] = useState(2.5);
  const [custoLead, setCustoLead] = useState(15);
  const [taxaConversaoCheckout, setTaxaConversaoCheckout] = useState(5);
  const [taxaConversaoVenda, setTaxaConversaoVenda] = useState(40);
  const [ticket, setTicket] = useState(997);

  // Cálculos detalhados
  const cliques = Math.round(investimentoTotal / (custoLead / (ctr / 100)));
  const leads = Math.round(cliques * (ctr / 100));
  const checkouts = Math.round(leads * (taxaConversaoCheckout / 100));
  const vendas = Math.round(checkouts * (taxaConversaoVenda / 100));
  const faturamentoBruto = vendas * ticket;
  const lucro = faturamentoBruto - investimentoTotal;
  const roas = investimentoTotal > 0 ? faturamentoBruto / investimentoTotal : 0;
  const roi = investimentoTotal > 0 ? ((lucro / investimentoTotal) * 100) : 0;
  const custoConversao = vendas > 0 ? investimentoTotal / vendas : 0;

  const handleBenchmarksGenerated = (benchmarks: any) => {
    if (benchmarks.custoLead) setCustoLead(benchmarks.custoLead);
    if (benchmarks.taxaConversao) setTaxaConversaoCheckout(benchmarks.taxaConversao);
    if (benchmarks.ticket) setTicket(benchmarks.ticket);
  };

  return (
    <div className="space-y-6">
      {/* Benchmarking */}
      <BenchmarkingCard 
        tipo="lancamento" 
        onBenchmarksGenerated={handleBenchmarksGenerated}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InputCard
          label="Investimento Total"
          value={investimentoTotal}
          onChange={setInvestimentoTotal}
          prefix="R$"
          icon={<DollarSign className="w-4 h-4" />}
          description="Valor total do investimento em tráfego"
        />
        <InputCard
          label="Custo por Lead (CPL)"
          value={custoLead}
          onChange={setCustoLead}
          prefix="R$"
          step={0.5}
          icon={<Target className="w-4 h-4" />}
          description="Quanto custa para gerar 1 lead"
        />
        <InputCard
          label="CTR - Taxa de Clique"
          value={ctr}
          onChange={setCtr}
          suffix="%"
          step={0.1}
          icon={<MousePointerClick className="w-4 h-4" />}
          description="% de pessoas que clicam no anúncio"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InputCard
          label="Taxa CPL → Checkout"
          value={taxaConversaoCheckout}
          onChange={setTaxaConversaoCheckout}
          suffix="%"
          step={0.1}
          icon={<ShoppingCart className="w-4 h-4" />}
          description="% de leads que iniciam o checkout"
        />
        <InputCard
          label="Taxa Checkout → Venda"
          value={taxaConversaoVenda}
          onChange={setTaxaConversaoVenda}
          suffix="%"
          step={0.1}
          icon={<Percent className="w-4 h-4" />}
          description="% de checkouts que finalizam compra"
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Cliques"
          value={cliques.toLocaleString('pt-BR')}
          icon={<MousePointerClick className="w-5 h-5" />}
          variant="default"
          description={`CTR de ${ctr}%`}
        />
        <MetricCard
          label="Leads (CPL)"
          value={leads.toLocaleString('pt-BR')}
          icon={<Users className="w-5 h-5" />}
          variant="default"
          description={`R$ ${custoLead.toFixed(2)} por lead`}
        />
        <MetricCard
          label="Checkouts"
          value={checkouts}
          icon={<ShoppingCart className="w-5 h-5" />}
          variant="primary"
          description={`${taxaConversaoCheckout}% dos leads`}
        />
        <MetricCard
          label="Vendas"
          value={vendas}
          icon={<Target className="w-5 h-5" />}
          variant="success"
          description={`${taxaConversaoVenda}% dos checkouts`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Custo por Venda (CAC)"
          value={`R$ ${custoConversao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          variant="default"
          description="Investimento ÷ Vendas"
        />
        <MetricCard
          label="Faturamento Previsto"
          value={`R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
        />
        <MetricCard
          label="Lucro Bruto"
          value={`R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant={lucro > 0 ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="ROAS"
          value={roas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          description={`Para cada R$ 1 investido, retorna R$ ${roas.toFixed(2)}`}
          variant={roas > 3 ? "success" : roas > 1.5 ? "primary" : "warning"}
        />
        <MetricCard
          label="ROI"
          value={`${roi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`}
          description={`Retorno de ${roi.toFixed(0)}% sobre o investimento`}
          variant={roi > 100 ? "success" : roi > 50 ? "primary" : "warning"}
        />
      </div>
    </div>
  );
}
