"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface ComingSoonFeature {
  readonly title: string;
  readonly description: string;
}

interface ComingSoonProps {
  readonly title: string;
  readonly subtitle: string;
  readonly badge: string;
  readonly icon: LucideIcon;
  readonly expectedFeatures: readonly ComingSoonFeature[];
  readonly backHref?: string;
  readonly backLabel?: string;
}

export function ComingSoon({
  title,
  subtitle,
  badge,
  icon: Icon,
  expectedFeatures,
  backHref = ROUTES.LEARNING_CONTENT.BASE,
  backLabel = "Back to Learning Content",
}: ComingSoonProps) {
  return (
    <div className="max-w-4xl mx-auto w-full py-4 sm:py-8 space-y-6">
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative space-y-6 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>{badge}</span>
          </div>

          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <Icon size={36} className="sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{backLabel}</span>
            </Link>
          </div>
        </div>

        {expectedFeatures.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-left">
            {expectedFeatures.map((feat) => (
              <div
                key={feat.title}
                className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-1 hover:border-border transition-colors"
              >
                <h2 className="text-xs sm:text-sm font-bold text-foreground">
                  {feat.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
