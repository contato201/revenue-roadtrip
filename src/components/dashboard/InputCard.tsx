import { ReactNode, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputCardProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  description?: string;
  step?: number;
  min?: number;
  className?: string;
}

export function InputCard({ 
  label, 
  value, 
  onChange, 
  prefix, 
  suffix, 
  icon,
  description,
  min = 0,
  className 
}: InputCardProps) {
  const [inputText, setInputText] = useState("");

  // Formata número para exibição (formato brasileiro)
  const formatNumber = (num: number): string => {
    if (!Number.isFinite(num) || Number.isNaN(num)) return "0";
    
    if (suffix === "%") {
      // Para percentuais, mostra até 2 casas decimais apenas se necessário
      if (num % 1 === 0) return num.toString();
      return num.toFixed(2).replace('.', ',').replace(/,?0+$/, '');
    }
    
    // Para valores monetários, sempre 2 casas decimais
    return num.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Sincroniza o texto exibido com o valor externo
  useEffect(() => {
    const safeValue = Number.isFinite(value) ? value : 0;
    setInputText(formatNumber(safeValue));
  }, [value, suffix]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    
    // Permite campo vazio durante edição
    if (raw === "") {
      setInputText("");
      return;
    }
    
    // Remove caracteres inválidos, mantém apenas números e vírgula
    let cleaned = raw.replace(/[^\d,]/g, '');
    
    // Trata múltiplas vírgulas - mantém apenas a primeira
    const firstComma = cleaned.indexOf(',');
    if (firstComma !== -1) {
      const beforeComma = cleaned.substring(0, firstComma);
      const afterComma = cleaned.substring(firstComma + 1).replace(/,/g, '');
      cleaned = beforeComma + ',' + afterComma.substring(0, 2);
    }
    
    setInputText(cleaned);
    
    // Converte para número
    const normalized = cleaned.replace(',', '.');
    const num = parseFloat(normalized);
    
    if (Number.isFinite(num) && !Number.isNaN(num)) {
      // Aplica limites
      const maxVal = suffix === "%" ? 100 : 10000000;
      const minVal = Math.max(0, min);
      const capped = Math.min(Math.max(minVal, num), maxVal);
      onChange(capped);
    }
  };

  const handleBlur = () => {
    // No blur, formata o valor corretamente
    const safeValue = Number.isFinite(value) ? value : 0;
    setInputText(formatNumber(safeValue));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // No focus, mostra valor raw para facilitar edição
    const safeValue = Number.isFinite(value) ? value : 0;
    if (suffix === "%") {
      setInputText(safeValue.toString().replace('.', ','));
    } else {
      setInputText(safeValue.toString().replace('.', ','));
    }
    // Seleciona todo o texto
    setTimeout(() => e.target.select(), 0);
  };

  return (
    <Card className={cn("p-5 border-2 border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md bg-card", className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          {icon && <div className="text-primary">{icon}</div>}
          <Label className="text-base font-display font-semibold text-foreground tracking-tight">{label}</Label>
        </div>
        <div className="relative">
          {prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
              {prefix}
            </span>
          )}
          <Input
            type="text"
            value={inputText}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              "h-12 text-lg font-semibold border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background text-foreground",
              prefix && "pl-12",
              suffix && "pr-14"
            )}
            autoComplete="off"
            inputMode="decimal"
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </Card>
  );
}
