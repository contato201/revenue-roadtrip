import { ReactNode, useState, useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  useEffect(() => {
    // Atualiza o valor exibido quando o valor externo muda
    setInputValue(formatForDisplay(value));
  }, [value, suffix]);

  // Restaura posição do cursor após formatação
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [inputValue, cursorPosition]);

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
    
    // Valida limite máximo durante digitação (10 milhões)
    if (numberValue > 1000000000) { // 10M em centavos = 1 bilhão de centavos
      return formatCurrencyWhileTyping('1000000000');
    }
    
    // Formata em reais com centavos
    const reais = Math.floor(numberValue / 100);
    const centavos = numberValue % 100;
    
    // Formata parte inteira com separadores de milhar
    const reaisFormatted = reais.toLocaleString('pt-BR');
    
    // Retorna valor formatado
    return `${reaisFormatted},${centavos.toString().padStart(2, '0')}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const currentCursor = e.target.selectionStart || 0;
    
    if (suffix === "%") {
      // Para percentual: remove tudo exceto números e vírgula
      let cleaned = input.replace(/[^\d,]/g, '');
      
      // Permite apenas uma vírgula e até 2 decimais
      const parts = cleaned.split(',');
      if (parts.length > 2) {
        cleaned = parts[0] + ',' + parts.slice(1).join('');
      }
      if (parts[1] && parts[1].length > 2) {
        cleaned = parts[0] + ',' + parts[1].substring(0, 2);
      }
      
      const numValue = parseFloat(cleaned.replace(',', '.'));
      
      // Validação: NaN vira 0
      if (isNaN(numValue) || !isFinite(numValue)) {
        if (cleaned === '' || cleaned === ',') {
          setInputValue(cleaned);
          onChange(0);
          return;
        }
        setInputValue('0');
        onChange(0);
        return;
      }
      
      // Limitar valores extremos (permite mais de 100% para performance, max 1000%)
      const maxValue = 1000;
      const cappedValue = Math.min(Math.max(0, numValue), maxValue);
      
      if (cappedValue !== numValue) {
        setInputValue(cappedValue.toString().replace('.', ','));
        onChange(cappedValue);
        return;
      }
      
      // Calcula nova posição do cursor (mantém posição relativa)
      const diff = cleaned.length - inputValue.length;
      const newCursor = Math.max(0, currentCursor + diff);
      setCursorPosition(newCursor);
      
      setInputValue(cleaned);
      onChange(cappedValue);
    } else {
      // Para valores monetários: calcula posição antes da formatação
      const previousValue = inputValue;
      const digitsBeforeCursor = input.substring(0, currentCursor).replace(/\D/g, '').length;
      
      // Formata em tempo real
      const formatted = formatCurrencyWhileTyping(input);
      
      if (formatted === '') {
        setInputValue('');
        onChange(0);
        setCursorPosition(0);
        return;
      }
      
      // Converte de volta para número (remove formatação)
      const numValue = parseFloat(formatted.replace(/\./g, '').replace(',', '.'));
      
      // Validação: NaN ou Infinity vira 0
      if (isNaN(numValue) || !isFinite(numValue)) {
        setInputValue('0,00');
        onChange(0);
        setCursorPosition(1);
        return;
      }
      
      // Valida limites razoáveis (mínimo 0, até 10 milhões)
      const capped = Math.min(Math.max(0, numValue), 10000000);
      
      // Calcula nova posição do cursor baseada em dígitos
      let newCursor = 0;
      let digitsCount = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          digitsCount++;
          if (digitsCount >= digitsBeforeCursor) {
            newCursor = i + 1;
            break;
          }
        }
      }
      
      // Ajuste fino: se estava após a vírgula, mantém após a vírgula
      if (currentCursor > previousValue.indexOf(',') && previousValue.indexOf(',') !== -1) {
        const commaIndex = formatted.indexOf(',');
        if (commaIndex !== -1) {
          newCursor = Math.max(newCursor, commaIndex + 1);
        }
      }
      
      setCursorPosition(newCursor);
      setInputValue(formatted);
      onChange(capped);
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
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleChange}
            className={cn(
              "h-12 text-lg font-semibold border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background text-foreground",
              prefix && "pl-12",
              suffix && "pr-14"
            )}
            autoComplete="off"
            inputMode={suffix === "%" ? "decimal" : "numeric"}
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
