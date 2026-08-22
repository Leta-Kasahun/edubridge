"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";

export default function StudentLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["STUDENT"]}>
        {children}
      </RoleGuard>
    </DashboardLayout>
  );
}
