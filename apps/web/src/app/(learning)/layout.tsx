"use client";

import { RoleGuard } from "@/shared/components/RoleGuard";

export default function LearningLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMIN", "SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {children}
      </div>
    </RoleGuard>
  );
}
