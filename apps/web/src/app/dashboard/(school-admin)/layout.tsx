"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";

export default function SchoolAdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "TENANT_ADMIN"]}>
        {children}
      </RoleGuard>
    </DashboardLayout>
  );
}
