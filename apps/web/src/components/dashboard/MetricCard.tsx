import { TrendingUp } from "lucide-react";

export interface MetricCardProps {
  readonly title: string;
  readonly value: string;
  readonly change: string;
  readonly isPositive: boolean;
  readonly icon: React.ElementType;
  readonly detail: string;
}

export function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  detail,
}: MetricCardProps) {
  return (
    <div className="bg-card p-4 sm:p-5 rounded-xl border border-border shadow-2xs hover:border-primary/30 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        <span
          className={`flex items-center text-xs font-semibold ${
            isPositive ? "text-primary" : "text-destructive"
          }`}
        >
          <TrendingUp size={13} className="mr-0.5" />
          {change}
        </span>
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
