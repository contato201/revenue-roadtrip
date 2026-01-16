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
  max?: number;
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
  max,
  className 
}: InputCardProps) {
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Determina o valor máximo baseado no tipo de campo
  const effectiveMax = max ?? (suffix === "%" ? 100 : 10000000);

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

  // Valida o valor e retorna mensagem de erro se houver
  const validate = (num: number): string | null => {
    if (!Number.isFinite(num) || Number.isNaN(num)) {
      return "Valor inválido";
    }
    if (num < 0) {
      return "Valor não pode ser negativo";
    }
    if (min !== undefined && num < min) {
      return `Valor mínimo: ${min}`;
    }
    if (suffix === "%" && num > 100) {
      return "Máximo 100%";
    }
    if (effectiveMax !== undefined && num > effectiveMax) {
      return `Valor máximo: ${effectiveMax.toLocaleString('pt-BR')}`;
    }
    return null;
  };

  // Sincroniza o texto exibido com o valor externo
  useEffect(() => {
    const safeValue = Number.isFinite(value) ? value : 0;
    setInputText(formatNumber(safeValue));
    setError(validate(safeValue));
  }, [value, suffix]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    
    // Permite campo vazio durante edição
    if (raw === "") {
      setInputText("");
      setError(null);
      return;
    }
    
    // Remove caracteres inválidos, mantém apenas números e vírgula
    let cleaned = raw.replace(/[^\d,.-]/g, '');
    
    // Remove sinais negativos (não permitido)
    cleaned = cleaned.replace(/-/g, '');
    
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
      // Valida o valor
      const validationError = validate(num);
      setError(validationError);
      
      // Aplica limites
      const minVal = Math.max(0, min);
      const capped = Math.min(Math.max(minVal, num), effectiveMax);
      
      // Só atualiza se o valor for válido (não negativo)
      if (num >= 0) {
        onChange(capped);
      }
    } else if (cleaned === "") {
      setError(null);
    }
  };

  const handleBlur = () => {
    // No blur, formata o valor corretamente e valida
    const safeValue = Number.isFinite(value) ? value : 0;
    setInputText(formatNumber(safeValue));
    setError(validate(safeValue));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // No focus, mostra valor raw para facilitar edição
    const safeValue = Number.isFinite(value) ? value : 0;
    if (suffix === "%") {
      setInputText(safeValue.toString().replace('.', ','));
    } else {
      setInputText(safeValue.toString().replace('.', ','));
    }
    // Seleciona todo o texto automaticamente para evitar concatenação
    setTimeout(() => e.target.select(), 0);
  };

  const hasError = error !== null;

  return (
    <Card className={cn(
      "p-5 border-2 transition-all shadow-sm hover:shadow-md bg-card",
      hasError 
        ? "border-destructive hover:border-destructive/70" 
        : "border-border hover:border-primary/30",
      className
    )}>
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          {icon && <div className={cn("text-primary", hasError && "text-destructive")}>{icon}</div>}
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
              "h-12 text-lg font-semibold border-2 transition-all bg-background text-foreground",
              hasError 
                ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" 
                : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20",
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
        {error ? (
          <p className="text-xs text-destructive font-medium">{error}</p>
        ) : description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </Card>
  );
}
