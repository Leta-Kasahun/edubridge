"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Layers,
  Plus,
  Trash2,
  GraduationCap,
} from "lucide-react";
import {
  CurriculumSubjectItem,
  CurriculumUnitItem,
} from "../types/structure.types";
import {
  useCurriculumSubjects,
  useCurriculumUnits,
  useDeleteSubject,
  useDeleteUnit,
  useReorderStructure,
} from "../hooks/useStructure";
import { useCurricula, useCurriculumDetails } from "../../curricula/hooks/useCurricula";
import { UnitItem } from "./UnitItem";
import { UnitFormModal } from "./UnitFormModal";
import { SubjectFormModal } from "./SubjectFormModal";
import {
  LoadingSpinner,
  ErrorAlert,
  TableToolbar,
  FilterGroup,
  SelectDropdown,
  SelectDropdownOption,
  ConfirmDeleteModal,
  SearchQueryProvider,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useMyTeacherAssignments } from "@/features/academic/assignments/teacher";
import { useDebounce } from "@/shared/hooks/useDebounce";

export function StructureView() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = Boolean(
    user?.roles?.includes("TEACHER") &&
      !user?.roles?.includes("SCHOOL_ADMIN") &&
      !user?.roles?.includes("SYSTEM_ADMIN")
  );
  const { allowedSubjectIds, allowedGradeIds } = useMyTeacherAssignments();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<CurriculumUnitItem | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<CurriculumUnitItem | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<CurriculumSubjectItem | null>(null);

  const {
    data: curriculaData,
    isLoading: isLoadingCurricula,
    error: curriculaError,
  } = useCurricula({ limit: 100 });

  const curricula = curriculaData?.data ?? [];

  const defaultCurriculum = useMemo(
    () => curricula.find((c) => c.status === "ACTIVE") || curricula[0],
    [curricula]
  );
  const effectiveCurriculumId = selectedCurriculumId || defaultCurriculum?.id || "";

  const {
    data: curriculumDetail,
  } = useCurriculumDetails(effectiveCurriculumId || null);

  const versions = curriculumDetail?.versions ?? [];

  const defaultVersion = useMemo(
    () => versions.find((v) => v.status === "ACTIVE") || versions[0],
    [versions]
  );
  const effectiveVersionId = selectedVersionId || defaultVersion?.id || "";

  const handleCurriculumChange = (currId: string) => {
    setSelectedCurriculumId(currId);
    setSelectedVersionId("");
    setSelectedSubjectId("");
  };

  const handleVersionChange = (verId: string) => {
    setSelectedVersionId(verId);
    setSelectedSubjectId("");
  };

  const {
    data: rawSubjects = [],
    isLoading: isLoadingSubjects,
    error: subjectsError,
  } = useCurriculumSubjects(effectiveVersionId);

  const subjects = useMemo(() => {
    if (!isTeacher) return rawSubjects;
    if (allowedSubjectIds.length === 0 && allowedGradeIds.length === 0) return rawSubjects;
    return rawSubjects.filter((s) => {
      const matchSubject =
        allowedSubjectIds.length === 0 ||
        allowedSubjectIds.includes(s.subjectId) ||
        allowedSubjectIds.includes(s.id);
      const matchGrade =
        allowedGradeIds.length === 0 ||
        allowedGradeIds.includes(s.gradeId);
      return matchSubject && matchGrade;
    });
  }, [rawSubjects, isTeacher, allowedSubjectIds, allowedGradeIds]);

  const displayedSubjects = useMemo(() => {
    if (!debouncedSearch.trim()) return subjects;
    const q = debouncedSearch.toLowerCase().trim();
    const matched = subjects.filter(
      (s) =>
        s.subjectName.toLowerCase().includes(q) ||
        s.subjectCode.toLowerCase().includes(q) ||
        `grade ${s.gradeLevel}`.toLowerCase().includes(q)
    );
    return matched.length > 0 ? matched : subjects;
  }, [subjects, debouncedSearch]);

  useEffect(() => {
    if (displayedSubjects.length > 0) {
      if (!selectedSubjectId || !displayedSubjects.some((s) => s.id === selectedSubjectId)) {
        const firstSubject = displayedSubjects[0];
        if (firstSubject) {
          setSelectedSubjectId(firstSubject.id);
        }
      }
    } else {
      setSelectedSubjectId("");
    }
  }, [displayedSubjects, selectedSubjectId]);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const {
    data: units = [],
    isLoading: isLoadingUnits,
    error: unitsError,
  } = useCurriculumUnits(selectedSubjectId, Boolean(selectedSubjectId));

  const filteredUnits = useMemo(() => {
    if (!debouncedSearch.trim()) return units;
    const q = debouncedSearch.toLowerCase().trim();
    return units.filter(
      (u) =>
        u.title.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        (u.description && u.description.toLowerCase().includes(q))
    );
  }, [units, debouncedSearch]);

  const deleteSubjectMutation = useDeleteSubject();
  const deleteUnitMutation = useDeleteUnit();
  const reorderMutation = useReorderStructure();

  const handleConfirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    await deleteSubjectMutation.mutateAsync({
      subjectId: subjectToDelete.id,
      versionId: selectedVersionId,
    });
    setSubjectToDelete(null);
    if (selectedSubjectId === subjectToDelete.id) {
      setSelectedSubjectId("");
    }
  };

  const handleConfirmDeleteUnit = async () => {
    if (!unitToDelete) return;
    await deleteUnitMutation.mutateAsync({
      unitId: unitToDelete.id,
      subjectId: selectedSubjectId,
    });
    setUnitToDelete(null);
  };

  const handleMoveUnit = async (
    unit: CurriculumUnitItem,
    direction: "up" | "down"
  ) => {
    const currentIndex = units.findIndex((u) => u.id === unit.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= units.length) return;

    const newOrdered = [...units];
    const [moved] = newOrdered.splice(currentIndex, 1);
    newOrdered.splice(targetIndex, 0, moved);

    await reorderMutation.mutateAsync({
      entityType: "unit",
      parentId: selectedSubjectId,
      orderedIds: newOrdered.map((u) => u.id),
    });
  };

  const filterGroups: readonly FilterGroup[] = useMemo(() => {
    return [
      {
        id: "curriculum",
        label: "Curriculum",
        selectedValue: selectedCurriculumId || "ALL",
        options: curricula.map((c) => ({
          label: c.name,
          value: c.id,
        })),
        onSelect: (val) => handleCurriculumChange(val === "ALL" ? "" : val),
        icon: BookOpen,
      },
      {
        id: "version",
        label: "Version",
        selectedValue: selectedVersionId || "ALL",
        options: versions.map((v) => ({
          label: v.name,
          value: v.id,
        })),
        onSelect: (val) => handleVersionChange(val === "ALL" ? "" : val),
        icon: Layers,
      },
    ];
  }, [curricula, selectedCurriculumId, versions, selectedVersionId]);

  if (isLoadingCurricula) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (curriculaError) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <ErrorAlert message={getErrorMessage(curriculaError, "Failed to load curricula.")} />
      </div>
    );
  }

  if (curricula.length === 0) {
    return (
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6">
        <div className="bg-card rounded-none border border-border p-8 text-center space-y-3 shadow-xs">
          <div className="h-12 w-12 rounded-none bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <BookOpen size={24} />
          </div>
          <h2 className="text-base font-bold text-foreground">
            No Curricula Available
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-12">
      {/* TableToolbar with Curriculum & Version Filter Dropdowns */}
      <div className="bg-card rounded-none border border-border p-3.5 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search curriculum structure..."
          filters={filterGroups}
          actionButton={
            !isTeacher ? (
              <button
                type="button"
                onClick={() => setIsAddSubjectOpen(true)}
                disabled={!effectiveVersionId}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus size={14} />
                <span>Subject</span>
              </button>
            ) : undefined
          }
        />
      </div>

      {/* Subject Tabs directly beneath TableToolbar */}
      {isLoadingSubjects ? (
        <div className="flex items-center justify-center p-6 bg-card rounded-none border border-border">
          <LoadingSpinner size={24} />
        </div>
      ) : subjectsError ? (
        <ErrorAlert message={getErrorMessage(subjectsError, "Failed to load subjects.")} />
      ) : displayedSubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-none border border-dashed border-border bg-card space-y-3">
          <div className="h-10 w-10 rounded-none bg-muted text-muted-foreground flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <p className="text-xs sm:text-sm font-bold text-foreground">
            {debouncedSearch ? "No matching subjects found" : "No subjects configured in this version"}
          </p>
          {!isTeacher && !debouncedSearch && (
            <button
              type="button"
              onClick={() => setIsAddSubjectOpen(true)}
              className="inline-flex items-center gap-1 h-7.5 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus size={13} />
              <span>Subject</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
          {displayedSubjects.map((sub) => {
            const isSelected = sub.id === selectedSubjectId;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer shrink-0 border whitespace-nowrap shadow-2xs ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span>Grade {sub.gradeLevel}: {sub.subjectName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-none font-bold ${
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {sub.unitCount}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selectedSubject && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3.5 sm:p-4 rounded-none border border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-none bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BookOpen size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  Grade {selectedSubject.gradeLevel} — {selectedSubject.subjectName} ({selectedSubject.subjectCode})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {units.length} units
                </p>
              </div>
            </div>

            {!isTeacher && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubjectToDelete(selectedSubject)}
                  title="Remove subject from version"
                  className="h-7.5 px-2.5 rounded-none text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Remove Subject</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUnitToEdit(null);
                    setIsAddUnitOpen(true);
                  }}
                  className="inline-flex items-center gap-1 h-7.5 px-2.5 rounded-none text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                >
                  <Plus size={13} />
                  <span>Unit</span>
                </button>
              </div>
            )}
          </div>

          {isLoadingUnits ? (
            <div className="flex items-center justify-center p-8 bg-card rounded-none border border-border">
              <LoadingSpinner size={28} />
            </div>
          ) : unitsError ? (
            <ErrorAlert message={getErrorMessage(unitsError, "Failed to load units.")} />
          ) : filteredUnits.length === 0 ? (
            <div className="bg-card rounded-none border border-dashed border-border p-8 text-center space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-none bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Layers size={20} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                {debouncedSearch ? "No matching units found" : "No units defined for this subject yet"}
              </p>
              {!isTeacher && !debouncedSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setUnitToEdit(null);
                    setIsAddUnitOpen(true);
                  }}
                  className="inline-flex items-center gap-1 h-7.5 px-3 rounded-none text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Unit</span>
                </button>
              )}
            </div>
          ) : (
            <SearchQueryProvider query={debouncedSearch}>
              <div className="space-y-3">
                {filteredUnits.map((unit, idx) => (
                  <UnitItem
                    key={unit.id}
                    unit={unit}
                    isFirst={idx === 0}
                    isLast={idx === filteredUnits.length - 1}
                    onEdit={(item) => setUnitToEdit(item)}
                    onDelete={(item) => setUnitToDelete(item)}
                    onMoveUp={(item) => handleMoveUnit(item, "up")}
                    onMoveDown={(item) => handleMoveUnit(item, "down")}
                    isReadOnly={isTeacher}
                  />
                ))}
              </div>
            </SearchQueryProvider>
          )}
        </div>
      )}

      <SubjectFormModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        versionId={effectiveVersionId}
      />

      <UnitFormModal
        isOpen={isAddUnitOpen || Boolean(unitToEdit)}
        onClose={() => {
          setIsAddUnitOpen(false);
          setUnitToEdit(null);
        }}
        curriculumSubjectId={selectedSubjectId}
        itemToEdit={unitToEdit}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(unitToDelete)}
        onClose={() => setUnitToDelete(null)}
        onConfirm={handleConfirmDeleteUnit}
        title="Delete Curriculum Unit"
        description="Are you sure you want to delete this unit and all its topics and objectives? This action cannot be undone."
        itemName={unitToDelete ? `${unitToDelete.code}: ${unitToDelete.title}` : undefined}
        isPending={deleteUnitMutation.isPending}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(subjectToDelete)}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={handleConfirmDeleteSubject}
        title="Remove Subject Configuration"
        description="Are you sure you want to remove this subject from the version? All underlying units and topics will also be removed."
        itemName={subjectToDelete ? `Grade ${subjectToDelete.gradeLevel}: ${subjectToDelete.subjectName}` : undefined}
        isPending={deleteSubjectMutation.isPending}
      />
    </div>
  );
}
