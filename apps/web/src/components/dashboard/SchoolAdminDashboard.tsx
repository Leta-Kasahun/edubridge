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
          title="School Members"
          value="Active"
          change="Normal"
          isPositive={true}
          icon={Users}
          detail="Enrolled students & faculty"
        />
        <MetricCard
          title="Academic Program"
          value="2025/26"
          change="Term 1"
          isPositive={true}
          icon={GraduationCap}
          detail="Current academic term"
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
