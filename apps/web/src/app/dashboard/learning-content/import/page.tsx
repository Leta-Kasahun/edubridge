"use client";

import { FileSpreadsheet } from "lucide-react";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { ComingSoon } from "@/shared/components/ComingSoon";
import { ROUTES } from "@/constants/routes";

const UPCOMING_IMPORT_FEATURES = [
  {
    title: "Common Cartridge & SCORM Ingestion",
    description:
      "Automated extraction and validation of standardized educational packages (SCORM 1.2/2004, IMS Common Cartridge, QTI assessment items).",
  },
  {
    title: "Batch Asset & Document Ingestion",
    description:
      "Upload ZIP archives containing organized digital textbook folders with metadata mapping to curriculum topics and codes.",
  },
  {
    title: "Interactive Mapping & Preview Pipeline",
    description:
      "Validate content structure prior to publishing with automated integrity checking and objective alignment preview.",
  },
  {
    title: "Content Versioning & Migration",
    description:
      "Seamlessly migrate and re-tag existing learning materials across upgraded curriculum version cycles.",
  },
] as const;

export default function LearningContentImportPage() {
  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMIN", "SCHOOL_ADMIN", "TEACHER"]}>
      <DashboardLayout>
        <ComingSoon
          title="Learning Content Batch Import"
          subtitle="Enterprise batch ingestion pipeline to import, validate, and associate digital educational packages with curriculum structures."
          badge="Coming Soon"
          icon={FileSpreadsheet}
          expectedFeatures={UPCOMING_IMPORT_FEATURES}
          backHref={ROUTES.LEARNING_CONTENT.BASE}
          backLabel="Back to Learning Content"
        />
      </DashboardLayout>
    </RoleGuard>
  );
}
