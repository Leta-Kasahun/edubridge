"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";

export default function TeacherLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["TEACHER"]}>
        {children}
      </RoleGuard>
    </DashboardLayout>
  );
}
