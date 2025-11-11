import { ReactNode } from "react";
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
  return (
    <Card className={cn("p-6 bg-gradient-card border-border/50", className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <Label className="text-sm font-semibold text-foreground">{label}</Label>
        </div>
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {prefix}
            </span>
          )}
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            step={step}
            min={min}
            className={cn(
              "h-12 text-lg font-semibold border-2 focus:border-primary transition-smooth",
              prefix && "pl-10",
              suffix && "pr-12"
            )}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
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
