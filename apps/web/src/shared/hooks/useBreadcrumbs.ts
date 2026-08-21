"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  generateBreadcrumbs,
  BreadcrumbItemData,
} from "../utils/breadcrumbs";

export interface UseBreadcrumbsOptions {
  readonly customLabels?: Readonly<Record<string, string>>;
  readonly prependHome?: boolean;
}

export function useBreadcrumbs(options?: UseBreadcrumbsOptions) {
  const pathname = usePathname();

  const breadcrumbs: readonly BreadcrumbItemData[] = useMemo(() => {
    return generateBreadcrumbs(pathname, options?.customLabels);
  }, [pathname, options?.customLabels]);

  return {
    pathname,
    breadcrumbs,
  };
}
