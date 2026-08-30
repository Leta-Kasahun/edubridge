"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { useAuthStore } from "@/stores/auth.store";
import { TeacherProfileView } from "@/features/teacher-profile";
import { StudentProfileView } from "@/features/students";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles ?? [];

  if (roles.includes("TEACHER")) {
    return (
      <DashboardLayout>
        <TeacherProfileView />
      </DashboardLayout>
    );
  }

  if (roles.includes("STUDENT")) {
    return (
      <DashboardLayout>
        <StudentProfileView />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
        <h1 className="text-base font-bold text-foreground">User Profile</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {user?.firstName} {user?.lastName} ({user?.username || user?.email})
        </p>
      </div>
    </DashboardLayout>
  );
}
