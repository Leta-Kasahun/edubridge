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
          title="Teachers"
          value="Active"
          change="Managed"
          isPositive={true}
          icon={GraduationCap}
          detail="Provisioned teacher accounts"
        />
        <MetricCard
          title="Students"
          value="Enrolled"
          change="Active"
          isPositive={true}
          icon={Users}
          detail="Grade & section rosters"
        />
        <MetricCard
          title="Security"
          value="Protected"
          change="Verified"
          isPositive={true}
          icon={ShieldCheck}
          detail="Policy enforcement"
        />
      </div>
    </div>
  );
}
