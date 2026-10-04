import {
  LayoutDashboard,
  Building2,
  Settings,
  User,
  Presentation,
  UserPlus,
  Award,
  Calendar,
  BookOpen,
  BookMarked,
  Users,
  FolderArchive,
  CheckSquare,
  GraduationCap,
  TrendingUp,
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
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Schools",
    href: ROUTES.SCHOOLS,
    icon: Building2,
  },
  {
    label: "Curriculum",
    href: ROUTES.CURRICULUM.BASE,
    icon: BookOpen,
    children: [
      { label: "Curricula", href: ROUTES.CURRICULUM.CURRICULA },
      { label: "Structure", href: ROUTES.CURRICULUM.STRUCTURE },
      { label: "Import", href: ROUTES.CURRICULUM.IMPORT },
    ],
  },
  {
    label: "Learning Materials",
    href: ROUTES.LEARNING_CONTENT.MATERIALS,
    icon: BookMarked,
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

export const SCHOOL_ADMIN_NAVIGATION_TREE: readonly NavNode[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Academic",
    href: ROUTES.ACADEMIC.BASE,
    icon: Calendar,
    children: [
      { label: "Academic Years", href: ROUTES.ACADEMIC.YEARS },
      { label: "Grades", href: ROUTES.ACADEMIC.GRADES },
      { label: "Sections", href: ROUTES.ACADEMIC.SECTIONS },
      { label: "Subjects", href: ROUTES.ACADEMIC.SUBJECTS },
      { label: "Student Assignments", href: ROUTES.ACADEMIC.ASSIGNMENTS_STUDENTS },
      { label: "Teacher Assignments", href: ROUTES.ACADEMIC.ASSIGNMENTS_TEACHERS },
    ],
  },
  {
    label: "Curriculum",
    href: ROUTES.CURRICULUM.BASE,
    icon: BookOpen,
    children: [
      { label: "Curricula", href: ROUTES.CURRICULUM.CURRICULA },
      { label: "Structure", href: ROUTES.CURRICULUM.STRUCTURE },
      { label: "Import", href: ROUTES.CURRICULUM.IMPORT },
    ],
  },
  {
    label: "Learning Materials",
    href: ROUTES.LEARNING_CONTENT.MATERIALS,
    icon: BookMarked,
  },
  {
    label: "Question Banks",
    href: ROUTES.QUESTION_BANK.BASE,
    icon: FolderArchive,
    children: [
      { label: "Question Banks", href: ROUTES.QUESTION_BANK.BANKS },
      { label: "Exam Types", href: ROUTES.QUESTION_BANK.EXAM_CONTEXTS },
    ],
  },
  {
    label: "Assessments",
    href: ROUTES.ASSESSMENTS.BASE,
    icon: CheckSquare,
  },
  {
    label: "Learning Progress",
    href: ROUTES.MASTERY,
    icon: TrendingUp,
  },
  {
    label: "Onboarding",
    href: ROUTES.PROVISIONING.BASE,
    icon: UserPlus,
    children: [
      { label: "Teachers", href: ROUTES.PROVISIONING.TEACHERS },
      { label: "Students", href: ROUTES.PROVISIONING.STUDENTS },
    ],
  },
  {
    label: "Qualified Teachers",
    href: ROUTES.STAFF_QUALIFICATIONS,
    icon: Award,
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
    label: "My Classes",
    href: ROUTES.TEACHER.CLASSES,
    icon: Presentation,
  },
  {
    label: "My Students",
    href: ROUTES.TEACHER.STUDENTS,
    icon: Users,
  },
  {
    label: "Question Banks",
    href: ROUTES.QUESTION_BANK.BASE,
    icon: FolderArchive,
    children: [
      { label: "Question Banks", href: ROUTES.QUESTION_BANK.BANKS },
      { label: "Exam Types", href: ROUTES.QUESTION_BANK.EXAM_CONTEXTS },
    ],
  },
  {
    label: "Assessments",
    href: ROUTES.ASSESSMENTS.BASE,
    icon: CheckSquare,
  },
  {
    label: "Learning Progress",
    href: ROUTES.MASTERY,
    icon: TrendingUp,
  },
  {
    label: "Learning Materials",
    href: ROUTES.LEARNING_CONTENT.MATERIALS,
    icon: BookMarked,
  },
  {
    label: "Curriculum",
    href: ROUTES.CURRICULUM.STRUCTURE,
    icon: BookOpen,
  },
  {
    label: "My Qualifications",
    href: ROUTES.QUALIFICATIONS,
    icon: Award,
  },
  {
    label: "My Profile",
    href: ROUTES.PROFILE,
    icon: User,
  },
];

export const STUDENT_NAVIGATION_TREE: readonly NavNode[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "My Class",
    href: ROUTES.STUDENT.MY_CLASS,
    icon: Presentation,
  },
  {
    label: "My Exams",
    href: ROUTES.ASSESSMENTS.BASE,
    icon: GraduationCap,
  },
  {
    label: "My Progress",
    href: ROUTES.STUDENT.PROGRESS,
    icon: TrendingUp,
  },
  {
    label: "Learning Materials",
    href: ROUTES.STUDENT.MATERIALS,
    icon: BookMarked,
  },
  {
    label: "My Profile",
    href: ROUTES.PROFILE,
    icon: User,
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
  pathname?: string | null,
  nodes: readonly NavNode[] = NAVIGATION_TREE
): readonly NavNode[] {
  if (!pathname) return [];

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
