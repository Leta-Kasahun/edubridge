import { DashboardLayout } from "@/shared/components/layouts";
import { RolesAccessManager } from "@/features/permissions";

export default function RolesSettingsPage() {
  return (
    <DashboardLayout>
      <RolesAccessManager />
    </DashboardLayout>
  );
}
