"use client";

import Link from "next/link";
import {
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
  ArrowRightLeft,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { ROUTES } from "@/constants/routes";

interface AcademicSectionItem {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly icon: React.ElementType;
  readonly badge: string;
}

const ACADEMIC_SECTIONS: readonly AcademicSectionItem[] = [
  {
    title: "Academic Years",
    description:
      "Manage institutional calendars, active sessions, and term schedules with Ethiopian calendar support.",
    href: ROUTES.ACADEMIC.YEARS,
    icon: Calendar,
    badge: "Calendar & Terms",
  },
  {
    title: "Grade Levels",
    description:
      "Configure secondary school grade structures (Grades 7–12), sequence, and cohort activation.",
    href: ROUTES.ACADEMIC.GRADES,
    icon: GraduationCap,
    badge: "Grades 7–12",
  },
  {
    title: "Class Sections",
    description:
      "Manage class cohorts, homeroom teacher allocations, student capacities, and section rosters.",
    href: ROUTES.ACADEMIC.SECTIONS,
    icon: Users,
    badge: "Class Cohorts",
  },
  {
    title: "Subjects & Curriculum",
    description:
      "National curriculum subjects, grade-level allocations, and learning objective anchors.",
    href: ROUTES.ACADEMIC.SUBJECTS,
    icon: BookOpen,
    badge: "Curriculum",
  },
  {
    title: "Student Assignments",
    description:
      "Manage active section enrollments, capacity-checked transfers, and year-end grade promotions.",
    href: ROUTES.ACADEMIC.ASSIGNMENTS_STUDENTS,
    icon: ArrowRightLeft,
    badge: "Transfers & Promotions",
  },
  {
    title: "Teacher Assignments",
    description:
      "Allocate subject teachers and homeroom staff across class cohorts with workload tracking.",
    href: ROUTES.ACADEMIC.ASSIGNMENTS_TEACHERS,
    icon: UserCheck,
    badge: "Teaching Load",
  },
];

export default function AcademicDashboardPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN"]}>
      <DashboardLayout>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {ACADEMIC_SECTIONS.map((sec) => {
            const Icon = sec.icon;

            return (
              <Link
                key={sec.href}
                href={sec.href}
                className="bg-card rounded-2xl border border-border p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {sec.badge}
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {sec.title}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {sec.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border mt-5 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Manage</span>
                  <ChevronRight
                    size={15}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
