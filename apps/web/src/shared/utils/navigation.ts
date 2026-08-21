import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  CalendarCheck,
  Award,
  Bell,
  Settings,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export interface NavNode {
  readonly label: string;
  readonly href: string;
  readonly icon?: React.ElementType;
  readonly badge?: string;
  readonly children?: readonly NavNode[];
}

export const NAVIGATION_TREE: readonly NavNode[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    href: "/students",
    icon: Users,
    badge: "1,420",
    children: [
      { label: "All Students", href: "/students" },
      { label: "New Admissions", href: "/students/admissions" },
      {
        label: "Classes",
        href: "/students/classes",
        children: [
          { label: "Physics", href: "/students/classes/physics" },
          { label: "Calculus", href: "/students/classes/calculus" },
          { label: "Chemistry", href: "/students/classes/chemistry" },
        ],
      },
      { label: "Student Records", href: "/students/records" },
    ],
  },
  {
    label: "Classes & Sections",
    href: "/classes",
    icon: BookOpen,
    children: [
      { label: "All Classrooms", href: "/classes" },
      { label: "Grade 9 Sections", href: "/classes/grade-9" },
      { label: "Grade 10 Sections", href: "/classes/grade-10" },
      { label: "Grade 11 Sections", href: "/classes/grade-11" },
      { label: "Grade 12 Sections", href: "/classes/grade-12" },
      { label: "Curriculum & Syllabus", href: "/classes/curriculum" },
    ],
  },
  {
    label: "Teachers & Staff",
    href: "/teachers",
    icon: UserCheck,
    children: [
      { label: "Faculty Directory", href: "/teachers" },
      { label: "Department Heads", href: "/teachers/departments" },
      { label: "Staff Attendance", href: "/teachers/attendance" },
    ],
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: CalendarCheck,
    children: [
      { label: "Daily Attendance", href: "/attendance" },
      { label: "Attendance Reports", href: "/attendance/reports" },
      { label: "Leave Requests", href: "/attendance/leaves" },
    ],
  },
  {
    label: "Exams & Grades",
    href: "/exams",
    icon: Award,
    children: [
      { label: "Assessment Schedule", href: "/exams" },
      { label: "Grading Scale", href: "/exams/grading" },
      { label: "Report Cards", href: "/exams/report-cards" },
    ],
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: Bell,
    badge: "3",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { label: "Security", href: "/settings/security" },
      { label: "Roles & Access", href: "/settings/roles" },
      { label: "Preferences", href: "/settings/preferences" },
    ],
  },
];

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
