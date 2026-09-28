import React from "react";
import { CheckCircle2, Clock, AlertCircle, MinusCircle } from "lucide-react";
import { MasteryLevel } from "../types/mastery.types";

interface TopicMasteryBadgeProps {
  readonly level: MasteryLevel;
  readonly accuracy?: number | null;
  readonly showAccuracy?: boolean;
  readonly compact?: boolean;
  readonly className?: string;
}

export function getMasteryLevelConfig(level: MasteryLevel) {
  switch (level) {
    case "MASTERED":
      return {
        label: "Mastered",
        studentLabel: "Mastered",
        icon: CheckCircle2,
        badgeClass:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        dotClass: "bg-emerald-500",
        textClass: "text-emerald-600 dark:text-emerald-400",
        progressColor: "bg-emerald-500",
        description: "Student demonstrates strong fluency and consistency (80%+).",
      };
    case "PROFICIENT":
      return {
        label: "Proficient",
        studentLabel: "Doing Well",
        icon: Clock,
        badgeClass:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        dotClass: "bg-blue-500",
        textClass: "text-blue-600 dark:text-blue-400",
        progressColor: "bg-blue-500",
        description: "Meets standard expectations (50% - 79%).",
      };
    case "DEVELOPING":
      return {
        label: "Developing",
        studentLabel: "Needs Practice",
        icon: AlertCircle,
        badgeClass:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        dotClass: "bg-amber-500",
        textClass: "text-amber-600 dark:text-amber-400",
        progressColor: "bg-amber-500",
        description: "Under 50% accuracy or insufficient evidence (< 3 items).",
      };
    case "NOT_STARTED":
    default:
      return {
        label: "Not Started",
        studentLabel: "Not Started",
        icon: MinusCircle,
        badgeClass:
          "bg-muted text-muted-foreground border-border",
        dotClass: "bg-muted-foreground/50",
        textClass: "text-muted-foreground",
        progressColor: "bg-muted-foreground/30",
        description: "No assessment attempts recorded yet.",
      };
  }
}

export function TopicMasteryBadge({
  level,
  accuracy,
  showAccuracy = false,
  compact = false,
  className = "",
}: TopicMasteryBadgeProps): React.JSX.Element {
  const config = getMasteryLevelConfig(level);
  const Icon = config.icon;

  if (compact) {
    return (
      <span
        title={`${config.label}${accuracy !== undefined && accuracy !== null ? ` (${accuracy}%)` : ""}`}
        className={`inline-flex items-center justify-center p-1 rounded-full border ${config.badgeClass} ${className}`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${config.badgeClass} ${className}`}
      title={config.description}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
      {showAccuracy && accuracy !== undefined && accuracy !== null && (
        <span className="font-semibold opacity-90">({accuracy}%)</span>
      )}
    </span>
  );
}
