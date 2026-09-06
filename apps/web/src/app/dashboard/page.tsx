"use client";

import { Suspense } from "react";
import { DashboardLayout } from "@/shared/components/layouts";
import { useAuthStore } from "@/stores/auth.store";
import {
  SystemAdminDashboard,
  SchoolAdminDashboard,
  TeacherDashboard,
  StudentDashboard,
} from "@/components/dashboard";

function DashboardContent() {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles ?? [];

  if (roles.includes("SYSTEM_ADMIN")) {
    return (
      <DashboardLayout>
        <SystemAdminDashboard />
      </DashboardLayout>
    );
  }

  if (roles.includes("TEACHER")) {
    return (
      <DashboardLayout>
        <TeacherDashboard />
      </DashboardLayout>
    );
  }

  if (roles.includes("STUDENT")) {
    return (
      <DashboardLayout>
        <StudentDashboard />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SchoolAdminDashboard />
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
