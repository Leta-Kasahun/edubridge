import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface OnboardingLayoutProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly stepper?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly className?: string;
}

export function OnboardingLayout({
  title,
  subtitle,
  stepper,
  children,
  footer,
  className,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {stepper && <div className="px-2 sm:px-6">{stepper}</div>}

        <div
          className={cn(
            "bg-card rounded-2xl border border-border p-5 sm:p-8 shadow-xs",
            className
          )}
        >
          {children}
        </div>
      </div>

      {footer && <div className="mt-8 text-center text-xs text-muted-foreground">{footer}</div>}
    </div>
  );
}
