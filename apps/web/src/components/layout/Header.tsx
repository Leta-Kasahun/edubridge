"use client";

import { useState } from "react";
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
  { label: "FAQ", href: "/#faq" },
  { label: "Contacts", href: "/#contacts" },
];

export function Header({ className }: { className?: string }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md transition-all shadow-2xs",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2.5 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          onClick={closeMobileMenu}
        >
          <Logo
            variant="full"
            size="sm"
            frame="none"
            priority
            textClassName="hidden min-[360px]:flex"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2.5">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground"
                )}
              >
                <ShieldCheck size={14} className="text-primary" />
                <span>First Login Setup</span>
              </Link>
              <Link
                href={ROUTES.AUTH.LOGIN}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "gap-1.5 text-xs font-semibold px-4 rounded-lg"
                )}
              >
                <span>Login</span>
                <ArrowRight size={13} />
              </Link>
            </>
          )}
        </div>

        <div className="flex sm:hidden items-center gap-2">
          {isAuthenticated && <UserMenu />}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-card px-4 py-5 space-y-4 shadow-lg">
          <nav className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="text-sm font-medium text-foreground hover:text-primary py-1 px-2 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-border flex flex-col gap-2.5">
              <Link
                href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
                onClick={closeMobileMenu}
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "w-full justify-center text-sm font-medium gap-2"
                )}
              >
                <ShieldCheck size={15} className="text-primary" />
                <span>First Login Setup</span>
              </Link>
              <Link
                href={ROUTES.AUTH.LOGIN}
                onClick={closeMobileMenu}
                className={cn(
                  buttonVariants({ size: "default" }),
                  "w-full justify-center text-sm font-semibold gap-2"
                )}
              >
                <span>Login</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
