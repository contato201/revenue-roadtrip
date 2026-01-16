import { useState, useMemo } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { BenchmarkingCard } from "../BenchmarkingCard";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Target, Phone, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

// Função segura para divisão
const safeDivide = (a: number, b: number, fallback = 0): number => {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return fallback;
  const result = a / b;
  return Number.isFinite(result) ? result : fallback;
};

// Função segura para multiplicação com porcentagem
const safePercent = (value: number, percent: number, fallback = 0): number => {
  if (!Number.isFinite(value) || !Number.isFinite(percent)) return fallback;
  if (percent < 0 || percent > 100) return fallback;
  const result = value * (percent / 100);
  return Number.isFinite(result) ? Math.round(result) : fallback;
};

export function NegocioLocalTab() {
  const [investimento, setInvestimento] = useState(1000);
  const [custoLead, setCustoLead] = useState(20);
  const [taxaAgendamento, setTaxaAgendamento] = useState(40);
  const [taxaComparecimento, setTaxaComparecimento] = useState(70);
  const [taxaFechamento, setTaxaFechamento] = useState(30);
  const [ticketMedio, setTicketMedio] = useState(2000);

  // Cálculos com useMemo para performance e validações
  const calculos = useMemo(() => {
    const leads = custoLead > 0 ? Math.round(safeDivide(investimento, custoLead)) : 0;
    const agendamentos = safePercent(leads, taxaAgendamento);
    const comparecimentos = safePercent(agendamentos, taxaComparecimento);
    const vendas = safePercent(comparecimentos, taxaFechamento);
    const faturamentoBruto = vendas * ticketMedio;
    const lucro = faturamentoBruto - investimento;
    const roi = safeDivide(lucro, investimento) * 100;
    const cac = safeDivide(investimento, vendas);

    return { leads, agendamentos, comparecimentos, vendas, faturamentoBruto, lucro, roi, cac };
  }, [investimento, custoLead, taxaAgendamento, taxaComparecimento, taxaFechamento, ticketMedio]);

  const { leads, agendamentos, comparecimentos, vendas, faturamentoBruto, lucro, roi, cac } = calculos;

  // Determina variantes de cor baseado nos valores
  const lucroVariant = lucro >= 0 ? "success" : "danger";
  const isLucro = lucro >= 0;

  const handleBenchmarksGenerated = (benchmarks: any) => {
    if (!benchmarks) return;
    
    const custoLeadMeta = benchmarks.meta?.custoLead;
    const custoLeadGoogle = benchmarks.google?.custoLead;
    const custoLeadMedio = custoLeadMeta && custoLeadGoogle 
      ? (custoLeadMeta + custoLeadGoogle) / 2 
      : custoLeadMeta || custoLeadGoogle;
    
    if (custoLeadMedio && Number.isFinite(custoLeadMedio)) {
      setCustoLead(custoLeadMedio);
    }
    if (benchmarks.taxaAgendamento && Number.isFinite(benchmarks.taxaAgendamento)) {
      setTaxaAgendamento(benchmarks.taxaAgendamento);
    }
    if (benchmarks.taxaComparecimento && Number.isFinite(benchmarks.taxaComparecimento)) {
      setTaxaComparecimento(benchmarks.taxaComparecimento);
    }
    if (benchmarks.taxaFechamento && Number.isFinite(benchmarks.taxaFechamento)) {
      setTaxaFechamento(benchmarks.taxaFechamento);
    }
    if (benchmarks.ticketMedio && Number.isFinite(benchmarks.ticketMedio)) {
      setTicketMedio(benchmarks.ticketMedio);
    }
  };

  return (
    <div className="space-y-6">
      <BenchmarkingCard 
        tipo="local" 
        onBenchmarksGenerated={handleBenchmarksGenerated}
      />

      <Card className="p-6 border-l-4 border-l-primary bg-card">
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">Como Funciona?</h3>
        <p className="text-sm text-muted-foreground">
          Este simulador mostra de forma simples quanto você pode faturar investindo em anúncios online. 
          Ajuste os valores abaixo para ver o resultado em tempo real!
        </p>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 border-l-primary pl-4">
          <h3 className="text-base font-display font-semibold text-foreground">1️⃣ Quanto você vai investir?</h3>
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
            label="Custo por Lead"
            value={custoLead}
            onChange={setCustoLead}
            prefix="R$"
            icon={<UserPlus className="w-4 h-4" />}
            description="Quanto custa para gerar 1 lead"
            min={0.01}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 border-l-primary pl-4">
          <h3 className="text-base font-display font-semibold text-foreground">2️⃣ Como seus clientes se comportam?</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InputCard
            label="Taxa de Agendamento"
            value={taxaAgendamento}
            onChange={setTaxaAgendamento}
            suffix="%"
            icon={<Calendar className="w-4 h-4" />}
            description="% de leads que agendam"
          />
          <InputCard
            label="Taxa de Comparecimento"
            value={taxaComparecimento}
            onChange={setTaxaComparecimento}
            suffix="%"
            icon={<Phone className="w-4 h-4" />}
            description="% que aparecem no agendamento"
          />
          <InputCard
            label="Taxa de Fechamento"
            value={taxaFechamento}
            onChange={setTaxaFechamento}
            suffix="%"
            icon={<Users className="w-4 h-4" />}
            description="% que efetivamente compra"
          />
          <InputCard
            label="Valor da Venda"
            value={ticketMedio}
            onChange={setTicketMedio}
            prefix="R$"
            icon={<DollarSign className="w-4 h-4" />}
            description="Valor médio de cada venda"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 border-l-primary pl-4 mb-4">
          <h3 className="text-base font-display font-semibold text-foreground">3️⃣ Seus Resultados</h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-5">
          <MetricCard
            label="👥 Leads"
            value={leads.toLocaleString('pt-BR')}
            description="Pessoas interessadas"
            variant="default"
          />
          <MetricCard
            label="📅 Agendamentos"
            value={agendamentos.toLocaleString('pt-BR')}
            description="Pessoas que agendaram"
            variant="default"
          />
          <MetricCard
            label="✅ Compareceram"
            value={comparecimentos.toLocaleString('pt-BR')}
            description="Pessoas que apareceram"
            variant="primary"
          />
          <MetricCard
            label="💰 Vendas"
            value={vendas.toLocaleString('pt-BR')}
            description="Clientes conquistados"
            variant="success"
          />
          <MetricCard
            label="💵 Faturamento"
            value={`R$ ${faturamentoBruto.toLocaleString('pt-BR')}`}
            description="Total vendido"
            variant="success"
          />
        </div>

        <Card className="p-6 border border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                CAC - Custo de Aquisição de Cliente
              </p>
              <p className="text-4xl font-display font-bold text-primary">
                R$ {cac.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {vendas > 0 
                  ? `Você gasta R$ ${cac.toFixed(2)} para conquistar cada cliente`
                  : "Ajuste os valores para calcular o CAC"}
              </p>
            </div>
            <div className="hidden md:block p-4 bg-primary/10 rounded-lg">
              <Target className="w-12 h-12 text-primary" />
            </div>
          </div>
        </Card>

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
                  <TrendingUp className={cn("w-10 h-10", isLucro ? "text-success" : "text-destructive")} />
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
                    ? lucro > 0 
                      ? `Você lucrará ${roi.toFixed(0)}% sobre o investimento!` 
                      : 'Sem lucro ou prejuízo'
                    : 'Ajuste os valores para ter lucro'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card border border-border">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Resumo Simples:</p>
              <div className="space-y-2 text-sm">
                <p>✓ Você investe: <span className="font-bold">R$ {investimento.toLocaleString('pt-BR')}</span></p>
                <p>✓ Gera: <span className="font-bold">{leads} leads</span></p>
                <p>✓ Consegue: <span className="font-bold">{vendas} clientes</span></p>
                <p>✓ CAC: <span className="font-bold text-primary">R$ {cac.toFixed(2)}</span></p>
                <p>✓ Fatura: <span className="font-bold text-success">R$ {faturamentoBruto.toLocaleString('pt-BR')}</span></p>
                <p className={cn(
                  "text-base font-bold pt-2 border-t",
                  isLucro ? "" : ""
                )}>
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
