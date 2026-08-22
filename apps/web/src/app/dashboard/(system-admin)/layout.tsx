"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";

export default function SystemAdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["SYSTEM_ADMIN"]}>
        {children}
      </RoleGuard>
    </DashboardLayout>
  );
}
