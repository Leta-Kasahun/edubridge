import { DashboardLayout } from "@/shared/components/layouts";
import { SecurityPolicyManager } from "@/features/security";

export default function SecuritySettingsPage() {
  return (
    <DashboardLayout>
      <SecurityPolicyManager />
    </DashboardLayout>
  );
}
