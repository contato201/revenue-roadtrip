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
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      // Quando não está em foco, mostra o valor formatado
      if (suffix === "%") {
        setDisplayValue(value.toFixed(2));
      } else {
        setDisplayValue(value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    }
  }, [value, isFocused, suffix]);

  const handleFocus = () => {
    setIsFocused(true);
    // Ao focar, mostra apenas o número puro para facilitar edição
    setDisplayValue(value.toString().replace('.', ','));
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Ao perder foco, atualiza o valor final
    const rawValue = displayValue.replace(/\./g, '').replace(',', '.');
    const numValue = parseFloat(rawValue) || 0;
    onChange(numValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Permite apenas números, vírgula e ponto
    const sanitized = inputValue.replace(/[^\d,\.]/g, '');
    setDisplayValue(sanitized);
    
    // Atualiza o valor em tempo real
    const rawValue = sanitized.replace(/\./g, '').replace(',', '.');
    const numValue = parseFloat(rawValue) || 0;
    onChange(numValue);
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
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
