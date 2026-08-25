import { ReactNode } from "react";
import { Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReviewItem {
  readonly label: string;
  readonly value: ReactNode;
}

export interface ReviewSection {
  readonly title: string;
  readonly onEdit?: () => void;
  readonly items: readonly ReviewItem[];
}

export interface OnboardingStepReviewProps {
  readonly sections: readonly ReviewSection[];
  readonly className?: string;
}

export function OnboardingStepReview({
  sections,
  className,
}: OnboardingStepReviewProps) {
  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {sections.map((section, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-border bg-background/50 p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            {section.onEdit && (
              <button
                type="button"
                onClick={section.onEdit}
                className="flex items-center gap-1 text-xs font-semibold text-foreground hover:underline cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
            {section.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-card/60 border border-border/60 gap-1"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground text-left sm:text-right truncate max-w-[200px]">
                  {item.value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
