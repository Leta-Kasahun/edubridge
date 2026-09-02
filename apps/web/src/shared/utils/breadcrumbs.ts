import { findNavNodeHierarchy, NAVIGATION_TREE } from "./navigation";
import { ROUTES } from "@/constants/routes";

export interface BreadcrumbItemData {
  readonly label: string;
  readonly href?: string;
  readonly isCurrent?: boolean;
}

const ROUTE_NAME_MAP: Readonly<Record<string, string>> = {
  dashboard: "Dashboard",
  academic: "Academic",
  years: "Academic Years",
  grades: "Grades",
  sections: "Sections",
  subjects: "Subjects",
  assignments: "Assignments",
  schools: "Manage Schools",
  provisioning: "Onboarding",
  teachers: "Teacher Onboarding",
  students: "Student Onboarding",
  profile: "My Profile",
  onboarding: "Onboarding",
  curriculum: "Curriculum",
  curricula: "Curricula & Versions",
  settings: "Settings",
  security: "Security Policy",
  roles: "Roles & Access",
  preferences: "Preferences",
};

export function formatBreadcrumbSegment(segment: string): string {
  const key = segment.toLowerCase();
  if (ROUTE_NAME_MAP[key]) {
    return ROUTE_NAME_MAP[key];
  }
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function generateBreadcrumbs(
  pathname: string,
  customLabels?: Readonly<Record<string, string>>
): readonly BreadcrumbItemData[] {
  const normalizedPath = pathname.split("?")[0].split("#")[0];

  if (!normalizedPath || normalizedPath === "/" || normalizedPath === ROUTES.DASHBOARD) {
    return [{ label: "Dashboard", href: ROUTES.DASHBOARD, isCurrent: true }];
  }

  const hierarchy = findNavNodeHierarchy(normalizedPath, NAVIGATION_TREE);
  const items: BreadcrumbItemData[] = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, isCurrent: false },
  ];

  if (hierarchy.length > 0) {
    hierarchy.forEach((node, index) => {
      if (node.href === ROUTES.DASHBOARD) return;
      const isLast = index === hierarchy.length - 1;
      const label =
        customLabels?.[node.href] || customLabels?.[node.label] || node.label;

      items.push({
        label,
        href: isLast ? undefined : node.href,
        isCurrent: isLast,
      });
    });
    return items;
  }

  const segments = normalizedPath.split("/").filter(Boolean);
  let accumulatedPath = "";

  segments.forEach((segment, index) => {
    accumulatedPath += `/${segment}`;
    if (accumulatedPath === ROUTES.DASHBOARD) return;

    const isLast = index === segments.length - 1;
    const label =
      customLabels?.[accumulatedPath] ||
      customLabels?.[segment] ||
      formatBreadcrumbSegment(segment);

    items.push({
      label,
      href: isLast ? undefined : accumulatedPath,
      isCurrent: isLast,
    });
  });

  return items;
}
