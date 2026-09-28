import React from "react";

interface MasteryProgressBarProps {
  readonly value: number; // 0 to 100
  readonly max?: number;
  readonly label?: string;
  readonly showValue?: boolean;
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

export function MasteryProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  size = "md",
  className = "",
}: MasteryProgressBarProps): React.JSX.Element {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const getBarColor = (pct: number) => {
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 50) return "bg-blue-500";
    if (pct > 0) return "bg-amber-500";
    return "bg-muted-foreground/30";
  };

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          {label && <span>{label}</span>}
          {showValue && <span className="tabular-nums font-semibold text-foreground">{percentage}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-muted rounded-full overflow-hidden ${heightClasses[size]}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full transition-all duration-500 rounded-full ${getBarColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
