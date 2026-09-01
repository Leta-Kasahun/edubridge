"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { DashboardTabsNav } from "./DashboardTabsNav";
import {
  GeneralOverviewTab,
  StudentsOverviewTab,
  TeachersOverviewTab,
  AcademicsOverviewTab,
} from "./tabs";
import type { DashboardTabId, DashboardTabItem } from "./types";

const ADMIN_TABS: readonly DashboardTabItem[] = [
  {
    id: "general",
    label: "General Overview",
    icon: LayoutDashboard,
  },
  {
    id: "students",
    label: "Students Overview",
    icon: Users,
  },
  {
    id: "teachers",
    label: "Teachers Overview",
    icon: GraduationCap,
  },
  {
    id: "academics",
    label: "Academics Overview",
    icon: BookOpen,
  },
];

export function SchoolAdminDashboardTabs() {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("general");

  return (
    <div className="space-y-6 w-full max-w-full">
      <DashboardTabsNav
        tabs={ADMIN_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="w-full">
        {activeTab === "general" && <GeneralOverviewTab />}
        {activeTab === "students" && <StudentsOverviewTab />}
        {activeTab === "teachers" && <TeachersOverviewTab />}
        {activeTab === "academics" && <AcademicsOverviewTab />}
      </div>
    </div>
  );
}
