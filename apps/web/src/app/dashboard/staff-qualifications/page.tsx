"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { StaffQualificationsView } from "@/features/staff-qualifications";

export default function StaffQualificationsPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN"]}>
      <DashboardLayout>
        <StaffQualificationsView />
      </DashboardLayout>
    </RoleGuard>
  );
}
