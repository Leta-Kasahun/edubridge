"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { CurriculumImportManager } from "@/features/curriculum/import";

export default function CurriculumImportPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "PLATFORM_ADMIN"]}>
      <DashboardLayout>
        <div className="space-y-4">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground">
              Curriculum Import
            </h1>
          </div>

          <CurriculumImportManager />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
