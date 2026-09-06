"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { UserMenu, Logo } from "@/shared/components";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface NavLinkItem {
  readonly label: string;
  readonly href: string;
}

const NAV_LINKS: readonly NavLinkItem[] = [
  { label: "Features", href: "/#features" },
  { label: "Exam Prep", href: "/#exam-prep" },
  { label: "Student Progress", href: "/#student-progress" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contacts", href: "/#contacts" },
];

const GLASS_BASE =
  "rounded-2xl border border-primary/30 bg-white/[0.15] backdrop-blur-sm " +
  "shadow-[0_0_0_1px_rgba(14,165,233,0.12),0_2px_16px_rgba(14,165,233,0.06),inset_0_1px_0_rgba(255,255,255,0.6)]";

const GLASS_SCROLLED =
  "rounded-2xl border border-primary/40 bg-white/[0.25] backdrop-blur-sm " +
  "shadow-[0_0_0_1px_rgba(14,165,233,0.18),0_4px_24px_rgba(14,165,233,0.09),inset_0_1px_0_rgba(255,255,255,0.8)]";

const desktopNavLinkClass = cn(
  "relative group px-3.5 py-2 rounded-xl text-xs xl:text-sm font-normal",
  "text-foreground/70 hover:text-primary transition-colors duration-200"
);

const navUnderlineClass = cn(
  "absolute bottom-1 left-3.5 right-3.5 h-px rounded-full",
  "bg-primary scale-x-0 group-hover:scale-x-100",
  "transition-transform duration-250 origin-left"
);

export function Header({ className }: { className?: string }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full px-2 min-[360px]:px-3 sm:px-6 lg:px-8 pt-3 pb-2",
        className
      )}
    >
      <div
        ref={menuRef}
        className={cn(
          "max-w-7xl mx-auto transition-all duration-500",
          scrolled ? GLASS_SCROLLED : GLASS_BASE
        )}
      >
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary shrink-0"
            onClick={closeMenu}
          >
            <Logo
              variant="full"
              size="sm"
              frame="none"
              priority
              textClassName="hidden min-[360px]:flex"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className={desktopNavLinkClass}>
                {link.label}
                <span className={navUnderlineClass} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "hidden sm:inline-flex text-xs font-normal gap-1.5",
                    "border border-primary/20 text-muted-foreground",
                    "hover:text-primary hover:border-primary/40 hover:bg-primary/5",
                    "rounded-xl px-3.5 py-1.5 transition-all duration-200"
                  )}
                >
                  <ShieldCheck size={14} />
                  <span>First Login Setup</span>
                </Link>
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "hidden sm:inline-flex gap-1.5 text-xs font-medium px-4 py-2 rounded-xl",
                    "shadow-[0_2px_12px_rgba(14,165,233,0.25)] hover:shadow-[0_4px_20px_rgba(14,165,233,0.35)]",
                    "transition-shadow duration-200"
                  )}
                >
                  <span>Login</span>
                  <ArrowRight size={13} />
                </Link>
              </>
            )}

            <button
              type="button"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className={cn(
                "lg:hidden p-2 rounded-xl transition-colors duration-200",
                "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            className={cn(
              "lg:hidden border-t border-primary/15 px-3 py-3",
              "bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-b-2xl"
            )}
          >
            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "relative group flex items-center py-2.5 px-3 rounded-xl",
                    "text-sm font-normal text-foreground/70 hover:text-primary",
                    "transition-colors duration-200"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute bottom-1 left-3 right-3 h-px rounded-full",
                      "bg-primary scale-x-0 group-hover:scale-x-100",
                      "transition-transform duration-250 origin-left"
                    )}
                  />
                </Link>
              ))}
            </nav>

            {!isAuthenticated && (
              <div className="pt-3 mt-1 border-t border-primary/10 flex flex-col gap-2">
                <Link
                  href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "w-full justify-center text-xs font-normal gap-2 rounded-xl",
                    "border-primary/25 text-muted-foreground",
                    "hover:text-primary hover:border-primary/40 hover:bg-primary/5",
                    "transition-all duration-200"
                  )}
                >
                  <ShieldCheck size={14} />
                  <span>First Login Setup</span>
                </Link>
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "w-full justify-center text-xs font-medium gap-2 rounded-xl",
                    "shadow-[0_2px_12px_rgba(14,165,233,0.25)]"
                  )}
                >
                  <span>Login</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
