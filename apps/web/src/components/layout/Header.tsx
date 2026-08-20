"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { UserMenu } from "@/shared/components";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function Header({ className }: { className?: string }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/80 bg-card/80 backdrop-blur-md transition-all",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.HOME} className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            <GraduationCap size={22} className="stroke-[2.3]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Edu<span className="text-primary">Bridge</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href={ROUTES.AUTH.LOGIN}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign In
              </Link>
              <Link
                href={ROUTES.AUTH.LOGIN}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "gap-1.5 text-xs sm:text-sm font-medium"
                )}
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
