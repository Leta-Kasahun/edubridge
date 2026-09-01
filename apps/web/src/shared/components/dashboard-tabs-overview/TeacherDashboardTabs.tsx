"use client";

import { useState } from "react";
import { DashboardTabsNav } from "./DashboardTabsNav";
import {
  TeacherOverviewTab,
  TeacherClassesTab,
  TeacherQualificationsTab,
} from "./tabs/teacher";
import type { TeacherTabId, DashboardTabItem } from "./types";

const TEACHER_TABS: readonly DashboardTabItem<TeacherTabId>[] = [
  {
    id: "overview",
    label: "Teaching Overview",
  },
  {
    id: "classes",
    label: "Classes",
  },
  {
    id: "qualifications",
    label: "Qualifications",
  },
];

export function TeacherDashboardTabs() {
  const [activeTab, setActiveTab] = useState<TeacherTabId>("overview");

  return (
    <div className="space-y-6 w-full max-w-full">
      <DashboardTabsNav
        tabs={TEACHER_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="w-full">
        {activeTab === "overview" && <TeacherOverviewTab />}
        {activeTab === "classes" && <TeacherClassesTab />}
        {activeTab === "qualifications" && <TeacherQualificationsTab />}
      </div>
    </div>
  );
}
