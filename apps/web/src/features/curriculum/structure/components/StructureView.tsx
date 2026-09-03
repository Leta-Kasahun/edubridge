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
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import {
  LoadingSpinner,
  ErrorAlert,
  SelectDropdown,
  SelectDropdownOption,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

export function StructureView() {
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

  useEffect(() => {
    if (curricula.length > 0 && !selectedCurriculumId) {
      const first = curricula[0];
      if (first) {
        setSelectedCurriculumId(first.id);
      }
    }
  }, [curricula, selectedCurriculumId]);

  const {
    data: curriculumDetail,
  } = useCurriculumDetails(selectedCurriculumId || null);

  const versions = curriculumDetail?.versions ?? [];

  useEffect(() => {
    if (versions.length > 0) {
      if (!selectedVersionId || !versions.some((v) => v.id === selectedVersionId)) {
        const activeVer = versions.find((v) => v.status === "ACTIVE") ?? versions[0];
        if (activeVer) {
          setSelectedVersionId(activeVer.id);
        }
      }
    } else {
      setSelectedVersionId("");
    }
  }, [versions, selectedVersionId]);

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
    data: subjects = [],
    isLoading: isLoadingSubjects,
    error: subjectsError,
  } = useCurriculumSubjects(selectedVersionId);

  useEffect(() => {
    if (subjects.length > 0) {
      if (!selectedSubjectId || !subjects.some((s) => s.id === selectedSubjectId)) {
        const firstSubject = subjects[0];
        if (firstSubject) {
          setSelectedSubjectId(firstSubject.id);
        }
      }
    } else {
      setSelectedSubjectId("");
    }
  }, [subjects, selectedSubjectId]);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const {
    data: units = [],
    isLoading: isLoadingUnits,
    error: unitsError,
  } = useCurriculumUnits(selectedSubjectId, Boolean(selectedSubjectId));

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

  const curriculumOptions: readonly SelectDropdownOption[] = useMemo(
    () =>
      curricula.map((c) => ({
        value: c.id,
        label: c.name,
        badge: c.code,
      })),
    [curricula]
  );

  const versionOptions: readonly SelectDropdownOption[] = useMemo(
    () =>
      versions.map((v) => ({
        value: v.id,
        label: v.name,
        badge: v.code,
      })),
    [versions]
  );

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
        <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-3 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
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
      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <h1 className="text-base sm:text-lg font-bold text-foreground">
            Curriculum Structure
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
          <SelectDropdown
            label="Curriculum"
            value={selectedCurriculumId}
            onChange={handleCurriculumChange}
            options={curriculumOptions}
            placeholder="Select curriculum..."
          />
          <SelectDropdown
            label="Version"
            value={selectedVersionId}
            onChange={handleVersionChange}
            options={versionOptions}
            placeholder={versions.length === 0 ? "No versions" : "Select version..."}
            disabled={versions.length === 0}
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground">
              Subjects
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {subjects.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddSubjectOpen(true)}
            disabled={!selectedVersionId}
            className="inline-flex items-center justify-center gap-1 h-7.5 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:pointer-events-none shadow-2xs"
          >
            <Plus size={13} />
            <span>Subject</span>
          </button>
        </div>

        {isLoadingSubjects ? (
          <div className="flex items-center justify-center p-6">
            <LoadingSpinner size={24} />
          </div>
        ) : subjectsError ? (
          <ErrorAlert message={getErrorMessage(subjectsError, "Failed to load subjects.")} />
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-muted/10 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-foreground">
              No subjects configured in this version
            </p>
            <button
              type="button"
              onClick={() => setIsAddSubjectOpen(true)}
              className="inline-flex items-center gap-1 h-7.5 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus size={13} />
              <span>Subject</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {subjects.map((sub) => {
              const isSelected = sub.id === selectedSubjectId;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`flex items-center gap-2 h-9 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-muted/50 text-foreground border-border hover:bg-muted"
                  }`}
                >
                  <span>Grade {sub.gradeLevel}: {sub.subjectName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
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
      </div>

      {selectedSubject && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3.5 sm:p-4 rounded-2xl border border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSubjectToDelete(selectedSubject)}
                title="Remove subject from version"
                className="h-7.5 px-2.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border transition-colors cursor-pointer flex items-center gap-1.5"
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
                className="inline-flex items-center gap-1 h-7.5 px-2.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
              >
                <Plus size={13} />
                <span>Unit</span>
              </button>
            </div>
          </div>

          {isLoadingUnits ? (
            <div className="flex items-center justify-center p-8 bg-card rounded-2xl border border-border">
              <LoadingSpinner size={28} />
            </div>
          ) : unitsError ? (
            <ErrorAlert message={getErrorMessage(unitsError, "Failed to load units.")} />
          ) : units.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-8 text-center space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Layers size={20} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                No units defined for this subject yet
              </p>
              <button
                type="button"
                onClick={() => {
                  setUnitToEdit(null);
                  setIsAddUnitOpen(true);
                }}
                className="inline-flex items-center gap-1 h-7.5 px-3 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Unit</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {units.map((unit, idx) => (
                <UnitItem
                  key={unit.id}
                  unit={unit}
                  isFirst={idx === 0}
                  isLast={idx === units.length - 1}
                  onEdit={(item) => setUnitToEdit(item)}
                  onDelete={(item) => setUnitToDelete(item)}
                  onMoveUp={(item) => handleMoveUnit(item, "up")}
                  onMoveDown={(item) => handleMoveUnit(item, "down")}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <SubjectFormModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        versionId={selectedVersionId}
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
