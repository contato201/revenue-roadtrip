import { useState } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { BenchmarkingCard } from "../BenchmarkingCard";
import { TrendingUp, DollarSign, Target, Percent } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function LancamentoTab() {
  const [investimentoTotal, setInvestimentoTotal] = useState(15000);
  const [custoLead, setCustoLead] = useState(3);
  const [taxaBaseLeads, setTaxaBaseLeads] = useState(1.20);
  const [ticket, setTicket] = useState(997);

  // Cálculos automáticos de CTR e Connect Rate
  const ctr = 2.5; // CTR padrão do mercado
  const connectRate = 80; // Taxa de connect padrão

  // Cálculos baseados no CPL selecionado
  const numeroLeads = Math.round(investimentoTotal / custoLead);
  const baseLeads = Math.round(numeroLeads * (taxaBaseLeads / 100));
  const vendas = baseLeads;
  const faturamentoBruto = vendas * ticket;
  const lucro = faturamentoBruto - investimentoTotal;
  const roas = investimentoTotal > 0 ? faturamentoBruto / investimentoTotal : 0;

  // Cenários de CPL para tabela
  const cenariosCPL = [2, 3, 4, 5, 6, 7];
  const calcularCenario = (cpl: number) => {
    const leads = Math.round(investimentoTotal / cpl);
    const base = Math.round(leads * (taxaBaseLeads / 100));
    const vendas = base;
    const retorno = vendas * ticket;
    const roasCenario = investimentoTotal > 0 ? retorno / investimentoTotal : 0;
    return { leads, base, vendas, retorno, roas: roasCenario };
  };

  const handleBenchmarksGenerated = (benchmarks: any) => {
    if (benchmarks.custoLead) setCustoLead(benchmarks.custoLead);
    if (benchmarks.ticket) setTicket(benchmarks.ticket);
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
          label="Investimento Total em tráfego"
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
          label="% de Base de leads"
          value={taxaBaseLeads}
          onChange={setTaxaBaseLeads}
          suffix="%"
          step={0.01}
          icon={<Percent className="w-4 h-4" />}
          description="Taxa de conversão para vendas"
        />
        <InputCard
          label="Ticket"
          value={ticket}
          onChange={setTicket}
          prefix="R$"
          icon={<DollarSign className="w-4 h-4" />}
          description="Valor do produto/serviço"
        />
      </div>

      {/* Métricas Automáticas CTR e Connect Rate */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="CTR (Taxa de Clique)"
          value={`${ctr}%`}
          variant="default"
          description={`CTR de ${ctr}% reduz o custo por clique, impactando diretamente o CPL`}
        />
        <MetricCard
          label="Connect Rate"
          value={`${connectRate}%`}
          variant="default"
          description={`${connectRate}% dos leads conectam, afetando a taxa de conversão final`}
        />
      </div>

      {/* Tabela de Cenários */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h3 className="text-lg font-display font-bold mb-4 text-foreground">Lançamentos - Cenários por CPL</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">CPL médio</TableHead>
                <TableHead className="font-bold">Nº de Leads</TableHead>
                <TableHead className="font-bold">% da Base de leads</TableHead>
                <TableHead className="font-bold">Nº de Vendas</TableHead>
                <TableHead className="font-bold">Ticket</TableHead>
                <TableHead className="font-bold">Retorno em Vendas</TableHead>
                <TableHead className="font-bold">ROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cenariosCPL.map((cpl) => {
                const cenario = calcularCenario(cpl);
                const isSelected = cpl === custoLead;
                return (
                  <TableRow 
                    key={cpl} 
                    className={isSelected ? "bg-primary/5" : ""}
                  >
                    <TableCell className="font-semibold">R$ {cpl.toFixed(2)}</TableCell>
                    <TableCell>{cenario.leads.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{taxaBaseLeads.toFixed(2)}%</TableCell>
                    <TableCell>{cenario.vendas}</TableCell>
                    <TableCell>R$ {ticket.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>R$ {cenario.retorno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="font-semibold">{cenario.roas.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Investimentos */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Investimento em Captação"
          value={`R$ ${(investimentoTotal * 0.7).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          variant="default"
          description="70% do investimento total"
        />
        <MetricCard
          label="Investimento Total em tráfego"
          value={`R$ ${investimentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="primary"
        />
      </div>

      {/* Resultados Finais */}
      <div className="grid gap-4 md:grid-cols-3">
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
        <MetricCard
          label="ROAS"
          value={roas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          description={`Para cada R$ 1 investido, retorna R$ ${roas.toFixed(2)}`}
          variant={roas > 3 ? "success" : roas > 1.5 ? "primary" : "warning"}
        />
      </div>
    </div>
  );
}
