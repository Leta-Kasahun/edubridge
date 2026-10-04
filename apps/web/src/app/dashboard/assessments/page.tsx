"use client";

import Link from "next/link";
import { CheckSquare, Award, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { StudentAssessmentsView } from "@/features/assessments";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/constants/routes";

interface AssessmentSectionItem {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly icon: React.ElementType;
  readonly badge: string;
  readonly actionLabel: string;
}

const ASSESSMENT_SECTIONS: readonly AssessmentSectionItem[] = [
  {
    title: "Assessments",
    description:
      "Create, schedule, assign, and publish curriculum assessments, quizzes, and midterm/final examinations.",
    href: ROUTES.ASSESSMENTS.LIST,
    icon: CheckSquare,
    badge: "Tests & Quizzes",
    actionLabel: "Manage",
  },
  {
    title: "Results & Grading",
    description:
      "Review student test submissions, evaluate open questions, analyze grade distributions, and publish scores.",
    href: ROUTES.ASSESSMENTS.RESULTS,
    icon: Award,
    badge: "Grading & Analytics",
    actionLabel: "Review",
  },
];

export default function AssessmentsOverviewPage() {
  const isStudent = useAuthStore(
    (s) =>
      Boolean(
        s.user?.roles?.includes("STUDENT") &&
          !s.user?.roles?.includes("TEACHER") &&
          !s.user?.roles?.includes("SCHOOL_ADMIN")
      )
  );

  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <DashboardLayout>
        {isStudent ? (
          <div className="max-w-7xl mx-auto space-y-6">
            <StudentAssessmentsView />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {ASSESSMENT_SECTIONS.map((sec) => {
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
                    <span>{sec.actionLabel}</span>
                    <ChevronRight
                      size={15}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
