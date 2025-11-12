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
  step = 1,
  min = 0,
  className 
}: InputCardProps) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Atualiza o valor exibido quando o valor externo muda
    setInputValue(formatForDisplay(value));
  }, [value, suffix]);

  const formatForDisplay = (val: number) => {
    if (suffix === "%") {
      return val.toString().replace('.', ',');
    }
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCurrencyWhileTyping = (value: string): string => {
    // Remove tudo exceto dígitos
    const digits = value.replace(/\D/g, '');
    
    if (digits === '') return '';
    
    // Converte para número (em centavos)
    const numberValue = parseInt(digits, 10);
    
    // Formata em reais com centavos
    const reais = Math.floor(numberValue / 100);
    const centavos = numberValue % 100;
    
    // Formata parte inteira com separadores de milhar
    const reaisFormatted = reais.toLocaleString('pt-BR');
    
    // Retorna valor formatado
    return `${reaisFormatted},${centavos.toString().padStart(2, '0')}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    if (suffix === "%") {
      // Para percentual: remove tudo exceto números e vírgula
      input = input.replace(/[^\d,]/g, '');
      
      // Permite apenas uma vírgula e até 2 decimais
      const parts = input.split(',');
      if (parts.length > 2) {
        input = parts[0] + ',' + parts.slice(1).join('');
      }
      if (parts[1] && parts[1].length > 2) {
        input = parts[0] + ',' + parts[1].substring(0, 2);
      }
      
      const numValue = parseFloat(input.replace(',', '.')) || 0;
      
      // Limitar valores extremos (mas permite mais de 100% para campos como "performance")
      const maxValue = 1000;
      if (numValue > maxValue) {
        setInputValue(maxValue.toString());
        onChange(maxValue);
        return;
      }
      
      setInputValue(input);
      onChange(numValue);
    } else {
      // Para valores monetários: formata em tempo real
      const formatted = formatCurrencyWhileTyping(input);
      
      if (formatted === '') {
        setInputValue('');
        onChange(0);
        return;
      }
      
      // Converte de volta para número (remove formatação)
      const numValue = parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0;
      
      // Valida limites razoáveis (até 10 milhões)
      const capped = Math.min(numValue, 10000000);
      
      setInputValue(formatted);
      onChange(capped);
      
      console.log("[InputCard] Formatado em tempo real:", { input, formatted, numValue: capped });
    }
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
            value={inputValue}
            onChange={handleChange}
            className={cn(
              "h-12 text-lg font-semibold border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background text-foreground",
              prefix && "pl-12",
              suffix && "pr-14"
            )}
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
