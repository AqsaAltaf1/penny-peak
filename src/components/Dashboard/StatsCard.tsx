import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn("neomorph-raised p-6 rounded-xl", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="neomorph-inset p-3 rounded-lg">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "text-sm font-medium",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}