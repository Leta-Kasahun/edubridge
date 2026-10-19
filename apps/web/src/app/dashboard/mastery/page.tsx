"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Layers, School, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { SearchQueryProvider } from "@/shared/components/SearchHighlight";
import { SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { getErrorMessage } from "@/shared/utils";
import { useDebounce } from "@/shared/hooks";
import { useGrades } from "@/features/academic/grades";
import { useSections } from "@/features/academic/sections";
import { useSubjects } from "@/features/academic/subjects";
import { useSectionMastery } from "@/features/mastery";
import { MasteryDrillDownView } from "@/features/mastery/components/MasteryDrillDownView";

export default function LearningProgressPage(): React.JSX.Element {
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 300);

  // Academic data queries
  const { data: gradesData } = useGrades({ isActive: true });
  const { data: sectionsData, isLoading: isSectionsLoading } = useSections({
    gradeId: selectedGradeId || undefined,
    status: "ACTIVE",
  });
  const { data: subjectsData, isLoading: isSubjectsLoading } = useSubjects({ isActive: true });

  // Auto-select first grade when grades load
  useEffect(() => {
    if (gradesData && gradesData.length > 0 && !selectedGradeId) {
      setSelectedGradeId(gradesData[0].id);
    }
  }, [gradesData, selectedGradeId]);

  // Dropdown options
  const sectionOptions: SelectDropdownOption[] = useMemo(() => {
    if (!sectionsData) return [];
    return sectionsData.map((s) => ({
      value: s.id,
      label: `Section ${s.name}`,
    }));
  }, [sectionsData]);

  const effectiveSectionId = selectedSectionId || sectionsData?.[0]?.id || "";

  const filterGroups: readonly FilterGroup[] = useMemo(() => {
    return [
      {
        id: "section",
        label: "Section",
        selectedValue: selectedSectionId || "ALL",
        options: [
          ...sectionOptions.map((s) => ({ label: s.label, value: s.value })),
        ],
        onSelect: (val) => setSelectedSectionId(val === "ALL" ? "" : val),
        icon: School,
      },
      {
        id: "subject",
        label: "Subject",
        selectedValue: selectedSubjectId || "ALL",
        options: [
          { label: "All Subjects", value: "ALL" },
          ...(subjectsData || []).map((sub) => ({ label: sub.name, value: sub.id })),
        ],
        onSelect: (val) => setSelectedSubjectId(val === "ALL" ? "" : val),
        icon: BookOpen,
      },
    ];
  }, [sectionOptions, selectedSectionId, subjectsData, selectedSubjectId]);

  // Section Learning Progress Query
  const {
    data: matrixData,
    isLoading: isMatrixLoading,
    error: matrixError,
  } = useSectionMastery(effectiveSectionId, {
    subjectId: selectedSubjectId || undefined,
  });

  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "SYSTEM_ADMIN"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-4 pb-10">
          {/* TableToolbar with Section & Subject Dropdowns */}
          <div className="bg-card rounded-none border border-border p-3.5 sm:p-4 shadow-xs">
            <TableToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search student progress..."
              filters={filterGroups}
            />
          </div>

          {/* Grade Tabs directly beneath toolbar */}
          {gradesData && gradesData.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
              {gradesData.map((grade) => {
                const isSelected = selectedGradeId === grade.id;

                return (
                  <button
                    key={grade.id}
                    type="button"
                    onClick={() => {
                      setSelectedGradeId(grade.id);
                      setSelectedSectionId("");
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer shadow-2xs",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <span>Grade {grade.level}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Content Body: Drill-Down Experience */}
          {!effectiveSectionId ? (
            <div className="p-12 text-center bg-card rounded-none border border-dashed border-border space-y-3">
              <div className="w-12 h-12 rounded-none bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Select a Section
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Choose a section above to view student progress.
              </p>
            </div>
          ) : isMatrixLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 bg-card rounded-none border border-border">
              <LoadingSpinner size={32} />
              <p className="text-sm font-medium text-muted-foreground">
                Loading progress records...
              </p>
            </div>
          ) : matrixError ? (
            <ErrorAlert
              message={getErrorMessage(matrixError, "Failed to load progress records.")}
            />
          ) : matrixData ? (
            <SearchQueryProvider query={debouncedSearch}>
              <MasteryDrillDownView data={matrixData} searchQuery={debouncedSearch} />
            </SearchQueryProvider>
          ) : null}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
