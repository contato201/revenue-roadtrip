import { useState } from "react";
import { InputCard } from "../InputCard";
import { MetricCard } from "../MetricCard";
import { TrendingUp, DollarSign, Target, Percent, Users, BarChart3 } from "lucide-react";

export function LancamentoTab() {
  const [investimento, setInvestimento] = useState(10500);
  const [cpm, setCpm] = useState(2);
  const [taxaConversao, setTaxaConversao] = useState(1.2);
  const [ticket, setTicket] = useState(997);

  // Cálculos
  const impressoes = (investimento / cpm) * 1000;
  const conversoes = Math.round(impressoes * (taxaConversao / 100));
  const faturamentoBruto = conversoes * ticket;
  const taxaHotmart = faturamentoBruto * 0.1;
  const faturamentoLiquido = faturamentoBruto - taxaHotmart;
  const lucro = faturamentoLiquido - investimento;
  const roas = investimento > 0 ? faturamentoBruto / investimento : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InputCard
          label="Investimento"
          value={investimento}
          onChange={setInvestimento}
          prefix="R$"
          icon={<DollarSign className="w-4 h-4" />}
          description="Valor total do investimento em tráfego"
        />
        <InputCard
          label="CPM"
          value={cpm}
          onChange={setCpm}
          prefix="R$"
          step={0.5}
          icon={<Target className="w-4 h-4" />}
          description="Custo por mil impressões"
        />
        <InputCard
          label="Taxa de Conversão"
          value={taxaConversao}
          onChange={setTaxaConversao}
          suffix="%"
          step={0.1}
          icon={<Percent className="w-4 h-4" />}
          description="Porcentagem de conversão"
        />
        <InputCard
          label="Ticket Médio"
          value={ticket}
          onChange={setTicket}
          prefix="R$"
          icon={<BarChart3 className="w-4 h-4" />}
          description="Valor do produto/serviço"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Impressões"
          value={impressoes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          icon={<Users className="w-5 h-5" />}
          variant="default"
        />
        <MetricCard
          label="Conversões"
          value={conversoes}
          icon={<Target className="w-5 h-5" />}
          variant="primary"
        />
        <MetricCard
          label="Faturamento Bruto"
          value={`R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Taxa Hotmart (10%)"
          value={`R$ ${taxaHotmart.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          variant="warning"
        />
        <MetricCard
          label="Faturamento Líquido"
          value={`R$ ${faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
          icon={<BarChart3 className="w-5 h-5" />}
          variant={roas > 3 ? "success" : roas > 1.5 ? "primary" : "warning"}
        />
      </div>
    </div>
  );
}
