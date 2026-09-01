"use client";

import { useState } from "react";
import { DashboardTabsNav } from "./DashboardTabsNav";
import {
  SystemAdminOverviewTab,
  SystemAdminTenantsTab,
} from "./tabs/system-admin";
import type { SystemAdminTabId, DashboardTabItem } from "./types";

const SYSTEM_ADMIN_TABS: readonly DashboardTabItem<SystemAdminTabId>[] = [
  {
    id: "overview",
    label: "System Overview",
  },
  {
    id: "tenants",
    label: "School Overview",
  },
];

export function SystemAdminDashboardTabs() {
  const [activeTab, setActiveTab] = useState<SystemAdminTabId>("overview");

  return (
    <div className="space-y-6 w-full max-w-full">
      <DashboardTabsNav
        tabs={SYSTEM_ADMIN_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="w-full">
        {activeTab === "overview" && <SystemAdminOverviewTab />}
        {activeTab === "tenants" && <SystemAdminTenantsTab />}
      </div>
    </div>
  );
}
