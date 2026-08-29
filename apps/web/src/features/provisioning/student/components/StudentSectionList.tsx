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
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          <span>Add section</span>
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
        />
      ))}

      <button
        type="button"
        onClick={onOpenAddSection}
        className="w-full py-3.5 px-4 rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
      >
        <Plus size={14} />
        <span>Add section</span>
      </button>
    </div>
  );
}
