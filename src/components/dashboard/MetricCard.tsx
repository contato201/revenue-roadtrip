import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  variant?: "default" | "success" | "warning" | "primary";
  className?: string;
}

export function MetricCard({ 
  label, 
  value, 
  icon, 
  description, 
  variant = "default",
  className 
}: MetricCardProps) {
  return (
    <Card className={cn(
      "p-5 border-2 border-border hover:shadow-md transition-all bg-card shadow-sm",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
          <p className={cn(
            "text-2xl font-display font-semibold",
            variant === "success" && "text-success",
            variant === "warning" && "text-warning",
            variant === "primary" && "text-primary",
            variant === "default" && "text-foreground"
          )}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "p-2.5 rounded-lg",
            variant === "success" && "bg-success/10 text-success",
            variant === "warning" && "bg-warning/10 text-warning",
            variant === "primary" && "bg-primary/10 text-primary",
            variant === "default" && "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
