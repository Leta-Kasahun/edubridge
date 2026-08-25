"use client";

import {
  Users,
  GraduationCap,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { MetricCard } from "./MetricCard";

export function SchoolAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Institution"
          value="Active"
          change="Online"
          isPositive={true}
          icon={Building2}
          detail="Institutional portal"
        />
        <MetricCard
          title="School Faculty"
          value="Teachers"
          change="Managed"
          isPositive={true}
          icon={GraduationCap}
          detail="Faculty & staff accounts"
        />
        <MetricCard
          title="School Members"
          value="Active"
          change="Normal"
          isPositive={true}
          icon={Users}
          detail="Enrolled students & faculty"
        />
        <MetricCard
          title="Security Status"
          value="Protected"
          change="Verified"
          isPositive={true}
          icon={ShieldCheck}
          detail="School security policy"
        />
      </div>
    </div>
  );
}
