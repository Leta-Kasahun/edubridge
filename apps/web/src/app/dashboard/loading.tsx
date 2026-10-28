import { PageSkeleton } from "@/shared/components";

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <PageSkeleton variant="dashboard" />
    </div>
  );
}
