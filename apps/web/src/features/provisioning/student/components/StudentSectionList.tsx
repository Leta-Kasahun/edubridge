"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { StudentSectionAccordion } from "./StudentSectionAccordion";
import {
  StudentRecord,
  AcademicStructureSection,
} from "../types/student-provisioning.types";

export interface StudentSectionListProps {
  readonly sections: readonly AcademicStructureSection[];
  readonly students: readonly StudentRecord[];
  readonly openSectionIds: ReadonlySet<string>;
  readonly onToggleSection: (sectionId: string) => void;
  readonly onOpenAddSection: () => void;
  readonly onViewDetails: (student: StudentRecord) => void;
  readonly onActivate: (student: StudentRecord) => void;
  readonly onDeactivate: (student: StudentRecord) => void;
  readonly onResetPassword?: (student: StudentRecord) => void;
}

function extractSectionSortKey(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/^(section|sec\.?|class|room)\s+/i, "")
    .trim();
  return cleaned || name.trim().toLowerCase();
}

export function StudentSectionList({
  sections,
  students,
  openSectionIds,
  onToggleSection,
  onOpenAddSection,
  onViewDetails,
  onActivate,
  onDeactivate,
  onResetPassword,
}: StudentSectionListProps) {
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) =>
      extractSectionSortKey(a.name).localeCompare(
        extractSectionSortKey(b.name),
        undefined,
        { numeric: true, sensitivity: "base" }
      )
    );
  }, [sections]);

  if (sortedSections.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center space-y-3">
        <p className="text-xs text-muted-foreground">
          No sections created for this grade level yet.
        </p>
        <button
          type="button"
          onClick={onOpenAddSection}
          className="inline-flex items-center gap-1.5 h-7.5 px-3 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
        >
          <Plus size={13} />
          <span>Section</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedSections.map((section) => (
        <StudentSectionAccordion
          key={section.id}
          section={section}
          students={students}
          isOpen={openSectionIds.has(section.id)}
          onToggle={() => onToggleSection(section.id)}
          onViewDetails={onViewDetails}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onResetPassword={onResetPassword}
        />
      ))}

      <button
        type="button"
        onClick={onOpenAddSection}
        className="w-full py-2.5 px-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
      >
        <Plus size={13} />
        <span>Section</span>
      </button>
    </div>
  );
}
