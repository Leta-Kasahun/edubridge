"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import { BreadcrumbItemData } from "../utils/breadcrumbs";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  if (trail.length === 0) return null;

  const intermediateItems = trail.slice(0, trail.length - 2);
  const parentItem = trail.length >= 2 ? trail[trail.length - 2] : null;
  const currentItem = trail[trail.length - 1];

  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn("flex items-center text-xs min-w-0 max-w-full overflow-hidden", className)}
    >
      {/* Desktop View: Full Breadcrumbs Trail */}
      <ol className="hidden sm:flex items-center gap-1 sm:gap-1.5 text-muted-foreground whitespace-nowrap overflow-hidden">
        {showHome && (
          <li className="inline-flex items-center shrink-0">
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
            <li key={item.label + index} className="inline-flex items-center gap-1 sm:gap-1.5 shrink-0">
              {index > 0 && (
                <ChevronRight size={13} className="text-muted-foreground/60 shrink-0" />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors font-medium hover:underline underline-offset-4 max-w-[140px] md:max-w-[180px] lg:max-w-[220px] truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "max-w-[140px] md:max-w-[200px] lg:max-w-[260px] truncate",
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

      {/* Mobile View: Collapsed Smart Breadcrumb (Fits down to 320px) */}
      <ol className="flex sm:hidden items-center gap-1 text-muted-foreground whitespace-nowrap overflow-hidden text-[11px]">
        {intermediateItems.length > 0 ? (
          <li className="relative inline-flex items-center shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer border border-border/50"
              aria-label="View parent pages"
            >
              <MoreHorizontal size={13} />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-7 w-48 rounded-xl bg-card border border-border shadow-xl p-1 z-50 flex flex-col text-xs animate-in fade-in-0 zoom-in-95">
                <div className="text-[10px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                  Navigation
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <Home size={13} className="text-muted-foreground shrink-0" />
                  <span>Dashboard Home</span>
                </Link>
                {intermediateItems.map((crumb) => (
                  <Link
                    key={crumb.label}
                    href={crumb.href || "#"}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted transition-colors truncate"
                  >
                    <span className="truncate">{crumb.label}</span>
                  </Link>
                ))}
              </div>
            )}

            <ChevronRight size={11} className="text-muted-foreground/60 mx-0.5 shrink-0" />
          </li>
        ) : showHome ? (
          <li className="inline-flex items-center shrink-0">
            <Link
              href="/dashboard"
              className="p-1 rounded hover:bg-muted/80 hover:text-primary transition-colors flex items-center"
              aria-label="Dashboard Home"
            >
              <Home size={13} />
            </Link>
            <ChevronRight size={11} className="text-muted-foreground/60 mx-0.5 shrink-0" />
          </li>
        ) : null}

        {parentItem && parentItem.href && (
          <li className="inline-flex items-center gap-1 shrink-0 min-w-0">
            <Link
              href={parentItem.href}
              className="hover:text-primary transition-colors font-medium max-w-[70px] xs:max-w-[90px] truncate"
            >
              {parentItem.label}
            </Link>
            <ChevronRight size={11} className="text-muted-foreground/60 shrink-0" />
          </li>
        )}

        <li className="inline-flex items-center shrink-0 min-w-0">
          <span
            aria-current="page"
            className="font-bold text-foreground max-w-[85px] xs:max-w-[110px] truncate"
          >
            {currentItem.label}
          </span>
        </li>
      </ol>
    </nav>
  );
}
