import { findNavNodeHierarchy, NAVIGATION_TREE, NavNode } from "./navigation";
import { ROUTES } from "@/constants/routes";

export interface BreadcrumbItemData {
  readonly label: string;
  readonly href?: string;
  readonly isCurrent?: boolean;
}

const ROUTE_NAME_MAP: Readonly<Record<string, string>> = {
  dashboard: "Dashboard",
  classes: "My Classes",
  students: "My Students",
  academic: "Academic",
  years: "Academic Years",
  grades: "Grades",
  sections: "Sections",
  subjects: "Subjects",
  assignments: "Assignments",
  schools: "Manage Schools",
  provisioning: "Onboarding",
  teachers: "Teacher Onboarding",
  profile: "My Profile",
  onboarding: "Onboarding",
  curriculum: "Curriculum",
  curricula: "Curricula",
  structure: "Structure",
  import: "Import",
  "learning-content": "Learning Materials",
  materials: "Learning Materials",
  settings: "Settings",
  security: "Security Policy",
  roles: "Roles & Access",
  preferences: "Preferences",
  assessments: "Assessments",
  "question-banks": "Question Banks",
  results: "My Evaluations",
  progress: "Learning Progress",
  result: "Attempt Result",
  runner: "Assessment Runner",
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isIdLikeSegment(segment: string): boolean {
  return UUID_REGEX.test(segment) || /^[0-9a-fA-F]{24,}$/.test(segment);
}

const STRUCTURAL_IGNORE_SEGMENTS: ReadonlySet<string> = new Set(["attempts"]);

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
  pathname?: string | null,
  customLabels?: Readonly<Record<string, string>>,
  navTree?: readonly NavNode[]
): readonly BreadcrumbItemData[] {
  if (!pathname) {
    return [{ label: "Dashboard", href: ROUTES.DASHBOARD, isCurrent: true }];
  }

  const normalizedPath = pathname.split("?")[0].split("#")[0];

  if (!normalizedPath || normalizedPath === "/" || normalizedPath === ROUTES.DASHBOARD) {
    return [{ label: "Dashboard", href: ROUTES.DASHBOARD, isCurrent: true }];
  }

  const hierarchy = findNavNodeHierarchy(normalizedPath, navTree ?? NAVIGATION_TREE);
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

  const rawSegments = normalizedPath.split("/").filter(Boolean);

  interface FilteredSegment {
    readonly raw: string;
    readonly path: string;
    readonly isId: boolean;
    readonly parentSegment?: string;
  }

  const filteredSegments: FilteredSegment[] = [];
  let currentAccumulated = "";

  for (let i = 0; i < rawSegments.length; i++) {
    const segment = rawSegments[i];
    currentAccumulated += `/${segment}`;

    if (currentAccumulated === ROUTES.DASHBOARD || segment === "dashboard") {
      continue;
    }

    if (STRUCTURAL_IGNORE_SEGMENTS.has(segment.toLowerCase())) {
      continue;
    }

    const isId = isIdLikeSegment(segment);
    const hasMoreContent = i < rawSegments.length - 1;

    // Skip intermediate raw IDs that only serve as path parameters to child actions
    if (isId && hasMoreContent) {
      continue;
    }

    const parentSegment = i > 0 ? rawSegments[i - 1] : undefined;
    filteredSegments.push({
      raw: segment,
      path: currentAccumulated,
      isId,
      parentSegment,
    });
  }

  filteredSegments.forEach((item, index) => {
    const isLast = index === filteredSegments.length - 1;
    let label =
      customLabels?.[item.path] ||
      customLabels?.[item.raw];

    if (!label) {
      if (item.isId) {
        if (item.parentSegment === "assessments") {
          label = "Assessment Details";
        } else if (item.parentSegment === "question-banks") {
          label = "Bank Details";
        } else if (item.parentSegment === "students") {
          label = "Student Details";
        } else if (item.parentSegment === "teachers") {
          label = "Teacher Details";
        } else {
          label = "Details";
        }
      } else {
        label = formatBreadcrumbSegment(item.raw);
      }
    }

    items.push({
      label,
      href: isLast ? undefined : item.path,
      isCurrent: isLast,
    });
  });

  return items;
}
