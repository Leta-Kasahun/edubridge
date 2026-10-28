"use client";

import { RoleGuard } from "@/shared/components/RoleGuard";
import { useAuthStore } from "@/stores/auth.store";
import { StudentAiTutorWidget } from "@/features/ai";

export default function LearningLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const isStudent = useAuthStore((state) => state.user?.roles?.includes("STUDENT"));

  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMIN", "SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {children}
        {isStudent && <StudentAiTutorWidget />}
      </div>
    </RoleGuard>
  );
}
