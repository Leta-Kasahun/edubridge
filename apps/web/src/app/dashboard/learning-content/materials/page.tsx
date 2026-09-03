"use client";

import { FileText } from "lucide-react";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { ComingSoon } from "@/shared/components/ComingSoon";
import { ROUTES } from "@/constants/routes";

const UPCOMING_MATERIAL_FEATURES = [
  {
    title: "Curriculum-Aligned Digital Library",
    description:
      "Directly map interactive lesson plans, textbook PDFs, worksheets, and teacher guides to specific curriculum units, topics, and learning objectives.",
  },
  {
    title: "Rich Multimedia & Interactive Content",
    description:
      "Support for embedded videos, interactive simulations, slide decks, and audio resources accessible to teachers and students.",
  },
  {
    title: "Granular Access & Sharing Controls",
    description:
      "Distribute materials to specific grades, sections, or individual classes with permission management and teacher collaboration tools.",
  },
  {
    title: "Offline Sync & Downloadable Packs",
    description:
      "Enable teachers and students to cache learning content for offline classroom use in bandwidth-constrained environments.",
  },
] as const;

export default function LearningMaterialsPage() {
  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMIN", "SCHOOL_ADMIN", "TEACHER"]}>
      <DashboardLayout>
        <ComingSoon
          title="Learning Materials Hub"
          subtitle="A centralized digital repository for organizing, publishing, and distributing educational content aligned with curriculum standards."
          badge="Coming Soon"
          icon={FileText}
          expectedFeatures={UPCOMING_MATERIAL_FEATURES}
          backHref={ROUTES.LEARNING_CONTENT.BASE}
          backLabel="Back to Learning Content"
        />
      </DashboardLayout>
    </RoleGuard>
  );
}
