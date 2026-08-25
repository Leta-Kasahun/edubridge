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
    <div className="min-h-screen bg-background flex flex-col py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col gap-6 sm:gap-8">
        <div className="space-y-1.5">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {stepper && (
          <div className="bg-card rounded-xl border border-border px-4 sm:px-6 py-4 shadow-xs">
            {stepper}
          </div>
        )}

        <div
          className={cn(
            "bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs flex-1",
            className
          )}
        >
          {children}
        </div>

        {footer && (
          <div className="pb-4 text-center text-xs text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
