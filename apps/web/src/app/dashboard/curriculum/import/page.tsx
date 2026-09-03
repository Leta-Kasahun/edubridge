"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { CurriculumImportManager } from "@/features/curriculum/import";

export default function CurriculumImportPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "PLATFORM_ADMIN"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Curriculum Import
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Import curriculum units, topics, and learning objectives into an existing curriculum version using standard Excel or CSV files.
            </p>
          </div>

          <CurriculumImportManager />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
