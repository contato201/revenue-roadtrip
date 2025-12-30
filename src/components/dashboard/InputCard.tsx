import { ReactNode, useState, useEffect, useCallback } from "react";
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

// Função auxiliar para garantir número válido
const toSafeNumber = (val: unknown): number => {
  if (typeof val !== 'number' || !Number.isFinite(val) || Number.isNaN(val)) {
    return 0;
  }
  return val;
};

export function InputCard({ 
  label, 
  value, 
  onChange, 
  prefix, 
  suffix, 
  icon,
  description,
  step = 1,
  min = 0,
  className 
}: InputCardProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Valor seguro garantido
  const safeValue = toSafeNumber(value);

  const formatForDisplay = useCallback((val: number): string => {
    try {
      const safe = toSafeNumber(val);
      if (suffix === "%") {
        return safe.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      }
      return safe.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch {
      return "0";
    }
  }, [suffix]);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatForDisplay(safeValue));
    }
  }, [safeValue, isFocused, formatForDisplay]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    try {
      const str = safeValue.toString().replace('.', ',');
      setDisplayValue(str);
    } catch {
      setDisplayValue("0");
    }
  }, [safeValue]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setDisplayValue(formatForDisplay(safeValue));
  }, [safeValue, formatForDisplay]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const input = e.target.value || "";
      
      // Se vazio, define como 0
      if (!input.trim()) {
        setDisplayValue("");
        onChange(0);
        return;
      }
      
      // Remove tudo exceto números e vírgula
      let cleaned = input.replace(/[^\d,]/g, '');
      
      // Não permite começar com vírgula
      if (cleaned.startsWith(',')) {
        cleaned = '0' + cleaned;
      }
      
      // Permite apenas uma vírgula
      const parts = cleaned.split(',');
      if (parts.length > 2) {
        cleaned = parts[0] + ',' + parts.slice(1).join('');
      }
      
      // Limita casas decimais a 2
      const newParts = cleaned.split(',');
      if (newParts[1] && newParts[1].length > 2) {
        cleaned = newParts[0] + ',' + newParts[1].substring(0, 2);
      }
      
      setDisplayValue(cleaned);
      
      // Converte para número
      const normalizedStr = cleaned.replace(',', '.');
      const numValue = parseFloat(normalizedStr);
      
      // Verifica se é um número válido
      if (Number.isNaN(numValue) || !Number.isFinite(numValue)) {
        onChange(0);
        return;
      }
      
      // Aplica limites
      const maxValue = suffix === "%" ? 100 : 10000000;
      const minValue = min >= 0 ? min : 0;
      const capped = Math.min(Math.max(minValue, numValue), maxValue);
      
      onChange(capped);
    } catch {
      // Em caso de qualquer erro, reseta para 0
      setDisplayValue("0");
      onChange(0);
    }
  }, [onChange, suffix, min]);

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
            value={displayValue}
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
