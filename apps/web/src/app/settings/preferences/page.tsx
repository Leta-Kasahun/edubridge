import { DashboardLayout } from "@/shared/components/layouts";
import { PreferencesManager } from "@/features/lookups";

export default function PreferencesSettingsPage() {
  return (
    <DashboardLayout>
      <PreferencesManager />
    </DashboardLayout>
  );
}
