"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
} from "lucide-react";
import { DashboardTabsNav } from "./DashboardTabsNav";
import {
  TeacherOverviewTab,
  TeacherClassesTab,
  TeacherGradesTab,
} from "./tabs/teacher";
import type { TeacherTabId, DashboardTabItem } from "./types";

const TEACHER_TABS: readonly DashboardTabItem<TeacherTabId>[] = [
  {
    id: "overview",
    label: "General Overview",
    icon: LayoutDashboard,
  },
  {
    id: "classes",
    label: "Classes Overview",
    icon: Users,
  },
  {
    id: "grades",
    label: "Grades Overview",
    icon: BookOpen,
  },
];

export function TeacherDashboardTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") as TeacherTabId | null;
  const activeTab: TeacherTabId = useMemo(() => {
    if (tabParam === "classes" || tabParam === "grades") {
      return tabParam;
    }
    return "overview";
  }, [tabParam]);

  const handleTabChange = useCallback(
    (newTab: TeacherTabId) => {
      if (newTab === "overview") {
        router.push("/dashboard");
      } else {
        router.push(`/dashboard?tab=${newTab}`);
      }
    },
    [router]
  );

  return (
    <div className="space-y-6 w-full max-w-full">
      <DashboardTabsNav
        tabs={TEACHER_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="w-full">
        {activeTab === "overview" && <TeacherOverviewTab />}
        {activeTab === "classes" && <TeacherClassesTab />}
        {activeTab === "grades" && <TeacherGradesTab />}
      </div>
    </div>
  );
}
