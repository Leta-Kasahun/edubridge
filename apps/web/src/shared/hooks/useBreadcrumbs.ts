"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  generateBreadcrumbs,
  BreadcrumbItemData,
} from "../utils/breadcrumbs";
import { getNavigationTree } from "../utils/navigation";
import { useAuthStore } from "@/stores/auth.store";

export interface UseBreadcrumbsOptions {
  readonly customLabels?: Readonly<Record<string, string>>;
  readonly prependHome?: boolean;
}

export function useBreadcrumbs(options?: UseBreadcrumbsOptions) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const navTree = useMemo(() => getNavigationTree(user?.roles), [user?.roles]);

  const breadcrumbs: readonly BreadcrumbItemData[] = useMemo(() => {
    return generateBreadcrumbs(pathname, options?.customLabels, navTree);
  }, [pathname, options?.customLabels, navTree]);

  return {
    pathname,
    breadcrumbs,
  };
}
