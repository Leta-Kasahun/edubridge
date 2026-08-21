"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import { BreadcrumbItemData } from "../utils/breadcrumbs";
import { cn } from "@/lib/utils";

export interface BreadcrumbsProps {
  readonly items?: readonly BreadcrumbItemData[];
  readonly customLabels?: Readonly<Record<string, string>>;
  readonly showHome?: boolean;
  readonly className?: string;
}

export function Breadcrumbs({
  items: explicitItems,
  customLabels,
  showHome = true,
  className,
}: BreadcrumbsProps) {
  const { breadcrumbs: autoItems } = useBreadcrumbs({ customLabels });
  const trail = explicitItems ?? autoItems;

  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumbs" className={cn("flex items-center text-xs", className)}>
      <ol className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-muted-foreground">
        {showHome && (
          <li className="inline-flex items-center">
            <Link
              href="/dashboard"
              className="p-1 rounded hover:bg-muted/80 hover:text-primary transition-colors flex items-center"
              aria-label="Dashboard Home"
            >
              <Home size={14} />
            </Link>
            <ChevronRight size={13} className="text-muted-foreground/60 mx-0.5" />
          </li>
        )}

        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;

          return (
            <li key={item.label + index} className="inline-flex items-center gap-1 sm:gap-1.5">
              {index > 0 && !showHome && (
                <ChevronRight size={13} className="text-muted-foreground/60" />
              )}
              {index > 0 && showHome && (
                <ChevronRight size={13} className="text-muted-foreground/60" />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors font-medium hover:underline underline-offset-4 max-w-[140px] sm:max-w-[200px] truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "max-w-[150px] sm:max-w-[240px] truncate",
                    isLast ? "font-semibold text-foreground" : "font-medium"
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
