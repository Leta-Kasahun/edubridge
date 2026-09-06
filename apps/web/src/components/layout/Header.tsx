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

const desktopNavLinkClass = cn(
  "relative group px-3.5 py-2 text-xs xl:text-sm font-medium",
  "text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors duration-200"
);

const navUnderlineClass = cn(
  "absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full",
  "bg-primary scale-x-0 group-hover:scale-x-100",
  "transition-transform duration-250 origin-left"
);

export function Header({ className }: { className?: string }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 border-b border-slate-200/80 dark:border-slate-800/80",
        scrolled ? "glass-header-scrolled shadow-xs" : "glass-header",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
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

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className={desktopNavLinkClass}>
                {link.label}
                <span className={navUnderlineClass} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "hidden sm:inline-flex text-xs font-medium gap-1.5 rounded-lg px-3.5 py-2",
                    "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
                    "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-primary transition-colors shadow-2xs"
                  )}
                >
                  <ShieldCheck size={14} className="text-primary" />
                  <span>First Login Setup</span>
                </Link>
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "hidden sm:inline-flex gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg",
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "shadow-[0_2px_10px_rgba(14,165,233,0.25)] transition-colors"
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
              className="lg:hidden p-2 rounded-lg transition-colors text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-800/80 glass-header-scrolled px-4 py-4 shadow-lg">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!isAuthenticated && (
            <div className="pt-4 mt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-2.5">
              <Link
                href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
                onClick={closeMenu}
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "w-full justify-center text-xs font-medium gap-2 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                )}
              >
                <ShieldCheck size={14} className="text-primary" />
                <span>First Login Setup</span>
              </Link>
              <Link
                href={ROUTES.AUTH.LOGIN}
                onClick={closeMenu}
                className={cn(
                  buttonVariants({ size: "default" }),
                  "w-full justify-center text-xs font-semibold gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                )}
              >
                <span>Login</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
