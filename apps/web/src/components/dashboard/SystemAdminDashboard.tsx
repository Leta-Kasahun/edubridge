import {
  Users,
  Building2,
  ShieldAlert,
  Server,
} from "lucide-react";
import { MetricCard } from "./MetricCard";

export function SystemAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Schools"
          value="2"
          change="+1"
          isPositive={true}
          icon={Building2}
          detail="Across all active partitions"
        />
        <MetricCard
          title="Platform Users"
          value="1,240"
          change="+12%"
          isPositive={true}
          icon={Users}
          detail="Administrators, teachers & students"
        />
        <MetricCard
          title="Security Status"
          value="Active"
          change="100%"
          isPositive={true}
          icon={ShieldAlert}
          detail="2FA & rate limiting active"
        />
        <MetricCard
          title="Service Health"
          value="99.9%"
          change="Normal"
          isPositive={true}
          icon={Server}
          detail="All system services operational"
        />
      </div>
    </div>
  );
}
