import { ReactNode, useState, useCallback } from "react";
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
  const [isFocused, setIsFocused] = useState(false);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const effectiveMax = max ?? (suffix === "%" ? 100 : 10000000);

  const formatDisplay = useCallback((num: number): string => {
    if (!Number.isFinite(num)) return "0";
    if (suffix === "%") {
      return num % 1 === 0 ? num.toString() : num.toFixed(2).replace('.', ',').replace(/,?0+$/, '');
    }
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [suffix]);

  const validate = useCallback((num: number): string | null => {
    if (num < 0) return "Valor não pode ser negativo";
    if (suffix === "%" && num > 100) return "Máximo 100%";
    if (num > effectiveMax) return `Máximo: ${effectiveMax.toLocaleString('pt-BR')}`;
    if (min > 0 && num < min) return `Mínimo: ${min}`;
    return null;
  }, [suffix, effectiveMax, min]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    const raw = value.toString().replace('.', ',');
    setRawText(raw);
    setError(null);
    setTimeout(() => e.target.select(), 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    
    // Allow empty
    if (text === "") {
      setRawText("");
      setError(null);
      return;
    }

    // Only allow digits, comma, dot
    const cleaned = text.replace(/[^\d,.]/g, '');
    setRawText(cleaned);

    // Parse
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    
    if (Number.isFinite(num) && num >= 0) {
      const clamped = Math.min(Math.max(min, num), effectiveMax);
      setError(validate(num));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setRawText("");
    const safeVal = Number.isFinite(value) ? value : 0;
    setError(validate(safeVal));
  };

  const displayValue = isFocused ? rawText : formatDisplay(value);
  const hasError = error !== null;

  return (
    <Card className={cn(
      "p-5 border-2 transition-all shadow-sm hover:shadow-md bg-card",
      hasError ? "border-destructive" : "border-border hover:border-primary/30",
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
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete="off"
            className={cn(
              "h-12 text-lg font-semibold border-2 transition-all bg-background text-foreground",
              hasError
                ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20",
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
        {error ? (
          <p className="text-xs text-destructive font-medium">{error}</p>
        ) : description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </Card>
  );
}
