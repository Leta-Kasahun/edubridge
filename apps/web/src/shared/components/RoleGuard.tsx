"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/constants/routes";
import { AppRole } from "@/constants/roles";

import { PageSkeleton } from "./skeletons";

export type AllowedRole = AppRole | string;

export interface RoleGuardProps {
  readonly allowedRoles: readonly AllowedRole[];
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback,
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isHydrated } = useAuthStore();

  const userRoles = user?.roles ?? [];
  const isSystemAdmin = userRoles.includes("SYSTEM_ADMIN");
  const hasAccess =
    isSystemAdmin || allowedRoles.some((role) => userRoles.includes(role));

  useEffect(() => {
    if (isHydrated && !isLoading && !isAuthenticated) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [isAuthenticated, isLoading, isHydrated, router]);

  if (!isHydrated || isLoading) {
    return fallback ? <>{fallback}</> : <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-card border border-border my-6">
        <div className="h-12 w-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-3">
          <ShieldAlert size={24} />
        </div>
        <h3 className="text-base font-bold text-foreground">Access Restricted</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Your current account role does not have permission to view this module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
