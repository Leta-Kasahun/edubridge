import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  readonly id: number;
  readonly title: string;
  readonly description?: string;
}

export interface OnboardingStepperProps {
  readonly steps: readonly StepItem[];
  readonly currentStep: number;
  readonly onStepClick?: (step: number) => void;
  readonly className?: string;
}

export function OnboardingStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: OnboardingStepperProps) {
  const progressPercent =
    steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = Boolean(onStepClick && isCompleted);

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step.id)}
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-200 border-2",
                  isCompleted &&
                    "bg-primary text-primary-foreground border-primary cursor-pointer shadow-xs",
                  isCurrent &&
                    "bg-card text-primary border-primary ring-4 ring-primary/20 font-bold shadow-xs",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-card text-muted-foreground border-border"
                )}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${step.id}: ${step.title}`}
              >
                {isCompleted ? <Check size={16} /> : step.id}
              </button>

              <div className="hidden sm:flex flex-col items-center mt-2 text-center max-w-[120px]">
                <span
                  className={cn(
                    "text-xs font-semibold tracking-tight",
                    isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sm:hidden mt-3 text-center">
        <span className="text-xs font-semibold text-foreground">
          Step {currentStep} of {steps.length}: {steps.find((s) => s.id === currentStep)?.title}
        </span>
      </div>
    </div>
  );
}
