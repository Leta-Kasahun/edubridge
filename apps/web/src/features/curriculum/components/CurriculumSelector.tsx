"use client";

import { useEffect, useMemo } from "react";
import { Check, Layers, BookOpen, Bookmark, Target, AlertCircle } from "lucide-react";
import { useCurricula, useCurriculumDetails } from "../curricula/hooks/useCurricula";
import {
  useCurriculumSubjects,
  useCurriculumUnits,
  useCurriculumTopics,
  useLearningObjectives,
} from "../structure/hooks/useStructure";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { cn } from "@/lib/utils";

export interface CurriculumSelection {
  readonly curriculumId: string;
  readonly versionId: string;
  readonly curriculumSubjectId: string;
  readonly subjectId: string;
  readonly gradeId: string;
  readonly unitId: string;
  readonly topicId: string;
  readonly objectiveIds: readonly string[];
}

export type CurriculumSelectionValue = Partial<CurriculumSelection>;

export interface CurriculumSelectorProps {
  readonly value: Partial<CurriculumSelection>;
  readonly onChange: (selection: CurriculumSelection) => void;
  readonly minLevel?: "VERSION" | "SUBJECT" | "UNIT" | "TOPIC" | "OBJECTIVE" | string;
  readonly multiObjective?: boolean;
  readonly allowedSubjectIds?: readonly string[];
  readonly allowedGradeIds?: readonly string[];
  readonly hideObjectives?: boolean;
  readonly multipleObjectives?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function CurriculumSelector({
  value,
  onChange,
  minLevel,
  multiObjective,
  allowedSubjectIds,
  allowedGradeIds,
  hideObjectives = false,
  multipleObjectives = true,
  disabled = false,
  className,
}: CurriculumSelectorProps) {
  const effectiveMultipleObjectives = multiObjective ?? multipleObjectives;
  const showTopic = minLevel !== "UNIT" && minLevel !== "SUBJECT" && minLevel !== "VERSION";
  const showObjectives =
    !hideObjectives && minLevel !== "UNIT" && minLevel !== "SUBJECT" && minLevel !== "VERSION";
  const { data: curriculaData, isLoading: isCurriculaLoading } = useCurricula({ limit: 50 });
  const curricula = curriculaData?.data ?? [];

  const selectedCurriculumId = value.curriculumId || curricula[0]?.id || "";

  const { data: curriculumDetail, isLoading: isDetailLoading } = useCurriculumDetails(
    selectedCurriculumId || null
  );
  const versions = curriculumDetail?.versions ?? [];

  const activeOrLatestVersion = useMemo(() => {
    return versions.find((v) => v.status === "ACTIVE") || versions[0] || null;
  }, [versions]);

  const selectedVersionId = value.versionId || activeOrLatestVersion?.id || "";

  const { data: curriculumSubjects = [], isLoading: isSubjectsLoading } =
    useCurriculumSubjects(selectedVersionId);

  const filteredCurriculumSubjects = useMemo(() => {
    return curriculumSubjects.filter((cs) => {
      const subjectMatch =
        !allowedSubjectIds || allowedSubjectIds.length === 0 || allowedSubjectIds.includes(cs.subjectId);
      const gradeMatch =
        !allowedGradeIds || allowedGradeIds.length === 0 || allowedGradeIds.includes(cs.gradeId);
      return subjectMatch && gradeMatch;
    });
  }, [curriculumSubjects, allowedSubjectIds, allowedGradeIds]);

  const selectedCurriculumSubject = useMemo(() => {
    return (
      filteredCurriculumSubjects.find((cs) => cs.id === value.curriculumSubjectId) ||
      filteredCurriculumSubjects.find(
        (cs) => cs.subjectId === value.subjectId && (!value.gradeId || cs.gradeId === value.gradeId)
      ) ||
      null
    );
  }, [filteredCurriculumSubjects, value.curriculumSubjectId, value.subjectId, value.gradeId]);

  const currentCurriculumSubjectId = selectedCurriculumSubject?.id || "";
  const currentSubjectId = selectedCurriculumSubject?.subjectId || value.subjectId || "";
  const currentGradeId = selectedCurriculumSubject?.gradeId || value.gradeId || "";

  const { data: units = [], isLoading: isUnitsLoading } = useCurriculumUnits(
    currentCurriculumSubjectId,
    Boolean(currentCurriculumSubjectId)
  );

  const selectedUnitId = value.unitId || "";

  const { data: topics = [], isLoading: isTopicsLoading } = useCurriculumTopics(
    selectedUnitId,
    Boolean(selectedUnitId)
  );

  const selectedTopicId = value.topicId || "";

  const { data: objectives = [], isLoading: isObjectivesLoading } = useLearningObjectives(
    selectedTopicId,
    Boolean(selectedTopicId)
  );

  const selectedObjectiveIds = useMemo(() => {
    return value.objectiveIds ?? [];
  }, [value.objectiveIds]);

  useEffect(() => {
    if (!value.curriculumId && selectedCurriculumId) {
      onChange({
        curriculumId: selectedCurriculumId,
        versionId: selectedVersionId,
        curriculumSubjectId: currentCurriculumSubjectId,
        subjectId: currentSubjectId,
        gradeId: currentGradeId,
        unitId: selectedUnitId,
        topicId: selectedTopicId,
        objectiveIds: selectedObjectiveIds,
      });
    }
  }, [
    value.curriculumId,
    selectedCurriculumId,
    selectedVersionId,
    currentCurriculumSubjectId,
    currentSubjectId,
    currentGradeId,
    selectedUnitId,
    selectedTopicId,
    selectedObjectiveIds,
    onChange,
  ]);

  const curriculumOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return curricula.map((c) => ({
      value: c.id,
      label: c.name,
      description: c.code,
      badge: c.status,
    }));
  }, [curricula]);

  const versionOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return versions.map((v) => ({
      value: v.id,
      label: v.name || v.code,
      description: v.code,
      badge: v.status,
    }));
  }, [versions]);

  const subjectOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return filteredCurriculumSubjects.map((cs) => ({
      value: cs.id,
      label: `${cs.subjectName} - Grade ${cs.gradeLevel}`,
      description: `Grade ${cs.gradeLevel} • ${cs.subjectCode || ""}`,
    }));
  }, [filteredCurriculumSubjects]);

  const unitOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return units.map((u) => ({
      value: u.id,
      label: `${u.code}: ${u.title}`,
      description: u.description || undefined,
    }));
  }, [units]);

  const topicOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return topics.map((t) => ({
      value: t.id,
      label: `${t.code}: ${t.title}`,
      description: t.description || undefined,
    }));
  }, [topics]);

  const handleCurriculumChange = (newCurriculumId: string) => {
    onChange({
      curriculumId: newCurriculumId,
      versionId: "",
      curriculumSubjectId: "",
      subjectId: "",
      gradeId: "",
      unitId: "",
      topicId: "",
      objectiveIds: [],
    });
  };

  const handleVersionChange = (newVersionId: string) => {
    onChange({
      curriculumId: selectedCurriculumId,
      versionId: newVersionId,
      curriculumSubjectId: "",
      subjectId: "",
      gradeId: "",
      unitId: "",
      topicId: "",
      objectiveIds: [],
    });
  };

  const handleSubjectChange = (newCurriculumSubjectId: string) => {
    const cs = filteredCurriculumSubjects.find((item) => item.id === newCurriculumSubjectId);
    onChange({
      curriculumId: selectedCurriculumId,
      versionId: selectedVersionId,
      curriculumSubjectId: newCurriculumSubjectId,
      subjectId: cs?.subjectId || "",
      gradeId: cs?.gradeId || "",
      unitId: "",
      topicId: "",
      objectiveIds: [],
    });
  };

  const handleUnitChange = (newUnitId: string) => {
    onChange({
      curriculumId: selectedCurriculumId,
      versionId: selectedVersionId,
      curriculumSubjectId: currentCurriculumSubjectId,
      subjectId: currentSubjectId,
      gradeId: currentGradeId,
      unitId: newUnitId,
      topicId: "",
      objectiveIds: [],
    });
  };

  const handleTopicChange = (newTopicId: string) => {
    onChange({
      curriculumId: selectedCurriculumId,
      versionId: selectedVersionId,
      curriculumSubjectId: currentCurriculumSubjectId,
      subjectId: currentSubjectId,
      gradeId: currentGradeId,
      unitId: selectedUnitId,
      topicId: newTopicId,
      objectiveIds: [],
    });
  };

  const handleObjectiveToggle = (objectiveId: string) => {
    if (!effectiveMultipleObjectives) {
      onChange({
        curriculumId: selectedCurriculumId,
        versionId: selectedVersionId,
        curriculumSubjectId: currentCurriculumSubjectId,
        subjectId: currentSubjectId,
        gradeId: currentGradeId,
        unitId: selectedUnitId,
        topicId: selectedTopicId,
        objectiveIds: [objectiveId],
      });
      return;
    }

    const currentSet = new Set(selectedObjectiveIds);
    if (currentSet.has(objectiveId)) {
      currentSet.delete(objectiveId);
    } else {
      currentSet.add(objectiveId);
    }

    onChange({
      curriculumId: selectedCurriculumId,
      versionId: selectedVersionId,
      curriculumSubjectId: currentCurriculumSubjectId,
      subjectId: currentSubjectId,
      gradeId: currentGradeId,
      unitId: selectedUnitId,
      topicId: selectedTopicId,
      objectiveIds: Array.from(currentSet),
    });
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <Layers size={13} className="text-primary" />
            <span>Curriculum Framework</span>
          </label>
          <SelectDropdown
            value={selectedCurriculumId}
            onChange={handleCurriculumChange}
            options={curriculumOptions}
            placeholder={isCurriculaLoading ? "Loading curricula..." : "Select curriculum..."}
            disabled={disabled || isCurriculaLoading || curricula.length === 0}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <Layers size={13} className="text-muted-foreground" />
            <span>Curriculum Version</span>
          </label>
          <SelectDropdown
            value={selectedVersionId}
            onChange={handleVersionChange}
            options={versionOptions}
            placeholder={isDetailLoading ? "Loading versions..." : "Select version..."}
            disabled={disabled || isDetailLoading || versions.length === 0}
          />
        </div>
      </div>

      <div className={cn("grid grid-cols-1 gap-3", showTopic ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <BookOpen size={13} className="text-primary" />
            <span>Course & Grade Level</span>
          </label>
          <SelectDropdown
            value={currentCurriculumSubjectId}
            onChange={handleSubjectChange}
            options={subjectOptions}
            placeholder={
              isSubjectsLoading
                ? "Loading subjects..."
                : filteredCurriculumSubjects.length === 0
                ? "No matching subjects"
                : "Select subject & grade..."
            }
            disabled={disabled || isSubjectsLoading || filteredCurriculumSubjects.length === 0}
            searchable
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <Bookmark size={13} className="text-primary" />
            <span>Curriculum Unit</span>
          </label>
          <SelectDropdown
            value={selectedUnitId}
            onChange={handleUnitChange}
            options={unitOptions}
            placeholder={
              !currentCurriculumSubjectId
                ? "Select course first"
                : isUnitsLoading
                ? "Loading units..."
                : units.length === 0
                ? "No units found"
                : "Select unit..."
            }
            disabled={disabled || !currentCurriculumSubjectId || isUnitsLoading || units.length === 0}
            searchable
          />
        </div>

        {showTopic && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Target size={13} className="text-primary" />
              <span>Topic</span>
            </label>
            <SelectDropdown
              value={selectedTopicId}
              onChange={handleTopicChange}
              options={topicOptions}
              placeholder={
                !selectedUnitId
                  ? "Select unit first"
                  : isTopicsLoading
                  ? "Loading topics..."
                  : topics.length === 0
                  ? "No topics found"
                  : "Select topic..."
              }
              disabled={disabled || !selectedUnitId || isTopicsLoading || topics.length === 0}
              searchable
            />
          </div>
        )}
      </div>

      {showObjectives && (
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Target size={13} className="text-emerald-500" />
              <span>Competency Learning Objectives</span>
            </label>
            {selectedObjectiveIds.length > 0 && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {selectedObjectiveIds.length} selected
              </span>
            )}
          </div>

          {!selectedTopicId ? (
            <div className="p-3.5 rounded-xl border border-dashed border-border bg-muted/20 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <AlertCircle size={14} className="text-muted-foreground" />
              <span>Select a topic above to view and link learning objectives.</span>
            </div>
          ) : isObjectivesLoading ? (
            <div className="p-4 rounded-xl border border-border bg-muted/20 text-center text-xs text-muted-foreground">
              Loading learning objectives...
            </div>
          ) : objectives.length === 0 ? (
            <div className="p-3.5 rounded-xl border border-dashed border-border bg-muted/20 text-center text-xs text-muted-foreground">
              No learning objectives defined for this topic.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 rounded-xl border border-border bg-background">
              {objectives.map((obj) => {
                const isSelected = selectedObjectiveIds.includes(obj.id);
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => handleObjectiveToggle(obj.id)}
                    disabled={disabled}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 border",
                      isSelected
                        ? "bg-primary/10 border-primary/40 text-foreground font-medium"
                        : "bg-card hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-md mt-0.5 shrink-0 flex items-center justify-center border transition-all",
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-border bg-background"
                      )}
                    >
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-muted text-foreground">
                          {obj.code}
                        </span>
                        <span className="line-clamp-2 text-xs">{obj.statement}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
