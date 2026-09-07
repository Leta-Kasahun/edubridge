"use client";

import Link from "next/link";
import {
  FolderArchive,
  ChevronRight,
  Layers,
} from "lucide-react";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { ROUTES } from "@/constants/routes";

interface QuestionBankSectionItem {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly icon: React.ElementType;
}

const QUESTION_BANK_SECTIONS: readonly QuestionBankSectionItem[] = [
  {
    title: "Question Banks",
    description: "Item banks, question authoring, and version management.",
    href: ROUTES.QUESTION_BANK.BANKS,
    icon: FolderArchive,
  },
  {
    title: "Exam Contexts",
    description: "Exam blueprints and regional/national frameworks.",
    href: ROUTES.QUESTION_BANK.EXAM_CONTEXTS,
    icon: Layers,
  },
];

export default function QuestionBankDashboardPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <DashboardLayout>
        <div className="grid grid-cols-1 sm:grid-cols-2 max-w-3xl gap-4">
          {QUESTION_BANK_SECTIONS.map((sec) => {
            const Icon = sec.icon;

            return (
              <Link
                key={sec.href}
                href={sec.href}
                className="bg-card rounded-2xl border border-border p-5 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground mb-3 group-hover:scale-105 transition-transform">
                    <Icon size={20} />
                  </div>

                  <h2 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {sec.title}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {sec.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border mt-4 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Open</span>
                  <ChevronRight
                    size={14}
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
