import {
  LayoutDashboard,
  Building2,
  Settings,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export interface NavNode {
  readonly label: string;
  readonly href: string;
  readonly icon?: React.ElementType;
  readonly badge?: string;
  readonly roles?: readonly string[];
  readonly children?: readonly NavNode[];
}

export const SYSTEM_ADMIN_NAVIGATION_TREE: readonly NavNode[] = [
  {
    label: "System Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Manage Schools",
    href: ROUTES.SCHOOLS,
    icon: Building2,
  },
  {
    label: "Settings",
    href: ROUTES.SETTINGS.BASE,
    icon: Settings,
    children: [
      { label: "Security Policy", href: ROUTES.SETTINGS.SECURITY },
      { label: "Roles & Permissions", href: ROUTES.SETTINGS.ROLES },
      { label: "Preferences", href: ROUTES.SETTINGS.PREFERENCES },
    ],
  },
];

export const SCHOOL_ADMIN_NAVIGATION_TREE: readonly NavNode[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Settings",
    href: ROUTES.SETTINGS.BASE,
    icon: Settings,
    children: [
      { label: "Security", href: ROUTES.SETTINGS.SECURITY },
      { label: "Roles & Access", href: ROUTES.SETTINGS.ROLES },
      { label: "Preferences", href: ROUTES.SETTINGS.PREFERENCES },
    ],
  },
];

export const TEACHER_NAVIGATION_TREE: readonly NavNode[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Settings",
    href: ROUTES.SETTINGS.BASE,
    icon: Settings,
    children: [
      { label: "Preferences", href: ROUTES.SETTINGS.PREFERENCES },
    ],
  },
];

export const STUDENT_NAVIGATION_TREE: readonly NavNode[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Settings",
    href: ROUTES.SETTINGS.BASE,
    icon: Settings,
    children: [
      { label: "Preferences", href: ROUTES.SETTINGS.PREFERENCES },
    ],
  },
];

export const NAVIGATION_TREE: readonly NavNode[] = SCHOOL_ADMIN_NAVIGATION_TREE;

export function getNavigationTree(roles?: readonly string[]): readonly NavNode[] {
  if (roles?.includes("SYSTEM_ADMIN")) {
    return SYSTEM_ADMIN_NAVIGATION_TREE;
  }
  if (roles?.includes("SCHOOL_ADMIN")) {
    return SCHOOL_ADMIN_NAVIGATION_TREE;
  }
  if (roles?.includes("TEACHER")) {
    return TEACHER_NAVIGATION_TREE;
  }
  if (roles?.includes("STUDENT")) {
    return STUDENT_NAVIGATION_TREE;
  }
  return SCHOOL_ADMIN_NAVIGATION_TREE;
}

export function findNavNodeHierarchy(
  pathname: string,
  nodes: readonly NavNode[] = NAVIGATION_TREE
): readonly NavNode[] {
  const normalized = pathname.split("?")[0].split("#")[0];

  for (const node of nodes) {
    if (node.href === normalized) {
      return [node];
    }
    if (node.children && node.children.length > 0) {
      const childMatch = findNavNodeHierarchy(normalized, node.children);
      if (childMatch.length > 0) {
        return [node, ...childMatch];
      }
      if (normalized.startsWith(node.href) && node.href !== ROUTES.DASHBOARD) {
        for (const child of node.children) {
          if (normalized.startsWith(child.href)) {
            const grandChildMatch = child.children
              ? findNavNodeHierarchy(normalized, child.children)
              : [];
            return [node, child, ...grandChildMatch];
          }
        }
        return [node];
      }
    }
  }

  return [];
}
