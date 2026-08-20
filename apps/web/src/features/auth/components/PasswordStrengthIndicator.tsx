import { Check, X } from "lucide-react";
import { calculatePasswordStrength, SecurityPolicy } from "../validations";
import { cn } from "@/lib/utils";

export interface PasswordStrengthIndicatorProps {
  password: string;
  policy?: Partial<SecurityPolicy>;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  policy,
  className,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const result = calculatePasswordStrength(password, policy);

  return (
    <div className={cn("space-y-2.5 w-full pt-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">Password Strength:</span>
        <span className="font-semibold" style={{ color: result.color }}>
          {result.label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            className="h-full rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                step <= result.score && result.score > 0
                  ? result.color
                  : "var(--muted, #E2E8F0)",
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {result.rules.map((rule) => (
          <div
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors duration-200",
              rule.passed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            )}
          >
            {rule.passed ? (
              <Check size={14} className="shrink-0 stroke-[2.5]" />
            ) : (
              <X size={14} className="shrink-0 text-muted-foreground/60" />
            )}
            <span className="truncate">{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
