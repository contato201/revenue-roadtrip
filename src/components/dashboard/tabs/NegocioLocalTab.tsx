import { useState } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Calendar, MessageSquare, Phone } from "lucide-react";

export function NegocioLocalTab() {
  const [investimento, setInvestimento] = useState(1000);
  const [custoAgendamento, setCustoAgendamento] = useState(50);
  const [taxaComparecimento, setTaxaComparecimento] = useState(70);
  const [taxaFechamento, setTaxaFechamento] = useState(30);
  const [ticketMedio, setTicketMedio] = useState(2000);

  // Cálculos passo a passo
  const agendamentos = Math.round(investimento / custoAgendamento);
  const comparecimentos = Math.round(agendamentos * (taxaComparecimento / 100));
  const vendas = Math.round(comparecimentos * (taxaFechamento / 100));
  const faturamentoBruto = vendas * ticketMedio;
  const lucro = faturamentoBruto - investimento;
  const roi = investimento > 0 ? ((lucro / investimento) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Explicação Simples */}
      <Card className="p-6 bg-gradient-primary text-primary-foreground">
        <h3 className="text-xl font-bold mb-2">Como Funciona?</h3>
        <p className="text-sm opacity-90">
          Este simulador mostra de forma simples quanto você pode faturar investindo em anúncios online. 
          Ajuste os valores abaixo para ver o resultado em tempo real!
        </p>
      </Card>

      {/* Inputs Simples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">1️⃣ Quanto você vai investir?</h3>
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
            label="Custo por Agendamento"
            value={custoAgendamento}
            onChange={setCustoAgendamento}
            prefix="R$"
            icon={<Calendar className="w-4 h-4" />}
            description="Quanto custa para conseguir 1 agendamento"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">2️⃣ Como seus clientes se comportam?</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <InputCard
            label="Taxa de Comparecimento"
            value={taxaComparecimento}
            onChange={setTaxaComparecimento}
            suffix="%"
            icon={<Phone className="w-4 h-4" />}
            description="% de pessoas que aparecem no agendamento"
          />
          <InputCard
            label="Taxa de Fechamento"
            value={taxaFechamento}
            onChange={setTaxaFechamento}
            suffix="%"
            icon={<Users className="w-4 h-4" />}
            description="% de quem aparece e efetivamente compra"
          />
          <InputCard
            label="Valor da Venda"
            value={ticketMedio}
            onChange={setTicketMedio}
            prefix="R$"
            icon={<DollarSign className="w-4 h-4" />}
            description="Quanto vale cada venda em média"
          />
        </div>
      </div>

      {/* Resultados Visuais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">3️⃣ Seus Resultados</h3>
        
        {/* Funil Visual */}
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            label="📅 Agendamentos"
            value={agendamentos}
            description="Pessoas que marcaram horário"
            variant="default"
          />
          <MetricCard
            label="✅ Compareceram"
            value={comparecimentos}
            description="Pessoas que apareceram"
            variant="primary"
          />
          <MetricCard
            label="💰 Vendas"
            value={vendas}
            description="Pessoas que compraram"
            variant="success"
          />
          <MetricCard
            label="💵 Faturamento"
            value={`R$ ${faturamentoBruto.toLocaleString('pt-BR')}`}
            description="Total vendido"
            variant="success"
          />
        </div>

        {/* Resultado Final */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-8 bg-gradient-success text-success-foreground">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-12 h-12" />
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">SEU LUCRO</p>
                <p className="text-4xl font-bold">
                  R$ {lucro.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm opacity-90 mt-2">
                  {lucro > 0 
                    ? `Você lucrará ${roi.toFixed(0)}% sobre o investimento! 🎉` 
                    : 'Ajuste os valores para ter lucro'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Resumo Simples:</p>
              <div className="space-y-2 text-sm">
                <p>✓ Você investe: <span className="font-bold">R$ {investimento.toLocaleString('pt-BR')}</span></p>
                <p>✓ Consegue: <span className="font-bold">{vendas} vendas</span></p>
                <p>✓ Fatura: <span className="font-bold text-success">R$ {faturamentoBruto.toLocaleString('pt-BR')}</span></p>
                <p className="text-base font-bold pt-2 border-t">
                  = Lucro de <span className="text-success">R$ {lucro.toLocaleString('pt-BR')}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
