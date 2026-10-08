"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Sliders, Layers } from "lucide-react";
import { FormField } from "@/shared/components/FormField";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { DatePicker } from "@/shared/components/DatePicker";
import { useGrades } from "@/features/academic/grades";
import { useSubjects } from "@/features/academic/subjects";
import {
  useCurricula,
  useCurriculumDetails,
} from "@/features/curriculum/curricula/hooks/useCurricula";
import {
  useCurriculumSubjects,
  useCurriculumUnits,
  useCurriculumTopics,
} from "@/features/curriculum/structure/hooks/useStructure";
import {
  AssessmentItem,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
} from "../types/assessment.types";
import {
  ASSESSMENT_TYPES,
  ASSESSMENT_TYPE_LABELS,
  GRADING_MODES,
  GRADING_MODE_LABELS,
  AssessmentType,
  GradingMode,
} from "@/shared/constants/assessment.constants";

function safeDateToInput(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

interface AssessmentFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (
    payload: CreateAssessmentPayload | UpdateAssessmentPayload
  ) => Promise<void>;
  readonly initialData?: AssessmentItem | null;
  readonly isLoading?: boolean;
}

type AssessmentScopeOption = "GENERAL" | "SUBJECT" | "GRADE_SUBJECT" | "UNIT" | "TOPIC";

const ASSESSMENT_SCOPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "GENERAL", label: "General" },
  { value: "SUBJECT", label: "Subject" },
  { value: "GRADE_SUBJECT", label: "Grade" },
  { value: "UNIT", label: "Unit" },
  { value: "TOPIC", label: "Topic" },
];

export function AssessmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: AssessmentFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AssessmentType>("QUIZ");
  const [gradingMode, setGradingMode] = useState<GradingMode>("AUTOMATIC");
  const [scope, setScope] = useState<AssessmentScopeOption>("GENERAL");
  const [gradeId, setGradeId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<string>("");
  const [maxAttempts, setMaxAttempts] = useState<string>("1");
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: gradesList = [] } = useGrades();
  const { data: subjectsList = [] } = useSubjects();
  const { data: curriculaData } = useCurricula({ limit: 100 });
  const curricula = curriculaData?.data ?? [];
  const selectedCurriculumId = curricula[0]?.id || "";
  const { data: curriculumDetail } = useCurriculumDetails(selectedCurriculumId || null);
  const versions = curriculumDetail?.versions ?? [];
  const activeVersion =
    versions.find((v) => v.status === "ACTIVE") ||
    versions.find((v) => v.status === "DRAFT") ||
    versions[0];
  const versionId = activeVersion?.id || "";
  const { data: curriculumSubjects = [] } = useCurriculumSubjects(versionId);

  const matchedCurriculumSubject = curriculumSubjects.find(
    (cs) => cs.gradeId === gradeId && cs.subjectId === subjectId
  );
  const curriculumSubjectId = matchedCurriculumSubject?.id || "";

  const { data: units = [] } = useCurriculumUnits(
    curriculumSubjectId,
    Boolean(curriculumSubjectId)
  );

  const { data: topics = [] } = useCurriculumTopics(
    unitId,
    Boolean(unitId)
  );

  const gradeOptions = useMemo(
    () => [
      { value: "", label: scope === "GENERAL" ? "All Grades" : "Select Grade" },
      ...gradesList.map((g) => ({ value: g.id, label: `Grade ${g.level}` })),
    ],
    [gradesList, scope]
  );

  const availableSubjectOptions = useMemo(() => {
    let list = subjectsList;
    if (gradeId && curriculumSubjects.length > 0) {
      const subjectIdsForGrade = new Set(
        curriculumSubjects
          .filter((cs) => cs.gradeId === gradeId)
          .map((cs) => cs.subjectId)
      );
      if (subjectIdsForGrade.size > 0) {
        list = subjectsList.filter((s) => subjectIdsForGrade.has(s.id));
      }
    }
    return [
      { value: "", label: scope === "GENERAL" ? "All Subjects" : "Select Subject" },
      ...list.map((s) => ({
        value: s.id,
        label: s.code ? `${s.code} - ${s.name}` : s.name,
      })),
    ];
  }, [subjectsList, gradeId, curriculumSubjects, scope]);

  const unitOptions = useMemo(
    () => [
      { value: "", label: "Select Unit" },
      ...units.map((u) => ({ value: u.id, label: `${u.code ? u.code + ": " : ""}${u.title}` })),
    ],
    [units]
  );

  const topicOptions = useMemo(
    () => [
      { value: "", label: "Select Topic" },
      ...topics.map((t) => ({ value: t.id, label: `${t.code ? t.code + ": " : ""}${t.title}` })),
    ],
    [topics]
  );

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setType(initialData.type);
      setGradingMode(initialData.gradingMode);

      const resolvedGrade = initialData.gradeId || initialData.grade?.id || "";
      const resolvedSubject = initialData.subjectId || initialData.subject?.id || "";
      const resolvedUnit = initialData.unitId || initialData.unit?.id || "";
      const resolvedTopic = initialData.topicId || initialData.topic?.id || "";

      setGradeId(resolvedGrade);
      setSubjectId(resolvedSubject);
      setUnitId(resolvedUnit);
      setTopicId(resolvedTopic);

      if (initialData.scope) {
        setScope(initialData.scope as AssessmentScopeOption);
      } else if (resolvedTopic) {
        setScope("TOPIC");
      } else if (resolvedUnit) {
        setScope("UNIT");
      } else if (resolvedGrade && resolvedSubject) {
        setScope("GRADE_SUBJECT");
      } else if (resolvedSubject) {
        setScope("SUBJECT");
      } else {
        setScope("GENERAL");
      }

      setTimeLimitMinutes(
        initialData.timeLimitMinutes ? String(initialData.timeLimitMinutes) : ""
      );
      setMaxAttempts(
        initialData.maxAttempts ? String(initialData.maxAttempts) : ""
      );
      setRandomizeQuestions(initialData.randomizeQuestions);
      setRandomizeOptions(initialData.randomizeOptions);
      setShowResults(initialData.showResults);
      setAvailableFrom(safeDateToInput(initialData.availableFrom));
      setAvailableUntil(safeDateToInput(initialData.availableUntil));
    } else {
      setTitle("");
      setDescription("");
      setType("QUIZ");
      setGradingMode("AUTOMATIC");
      setScope("GENERAL");
      setGradeId("");
      setSubjectId("");
      setUnitId("");
      setTopicId("");
      setTimeLimitMinutes("30");
      setMaxAttempts("1");
      setRandomizeQuestions(false);
      setRandomizeOptions(false);
      setShowResults(true);
      setAvailableFrom("");
      setAvailableUntil("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (scope === "SUBJECT" && !subjectId) {
      newErrors.subjectId = "Please select a subject";
    }

    if ((scope === "GRADE_SUBJECT" || scope === "UNIT" || scope === "TOPIC") && !gradeId) {
      newErrors.gradeId = "Please select a grade level";
    }

    if ((scope === "GRADE_SUBJECT" || scope === "UNIT" || scope === "TOPIC") && !subjectId) {
      newErrors.subjectId = "Please select a subject";
    }

    if ((scope === "UNIT" || scope === "TOPIC") && !unitId) {
      newErrors.unitId = "Please select a curriculum unit";
    }

    if (scope === "TOPIC" && !topicId) {
      newErrors.topicId = "Please select a specific topic";
    }

    if (availableFrom && availableUntil) {
      if (new Date(availableFrom) > new Date(availableUntil)) {
        newErrors.availableUntil = "Closing date must be after opening date";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: CreateAssessmentPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      gradingMode,
      scope: scope === "GENERAL" ? undefined : scope,
      subjectId: subjectId || undefined,
      gradeId: gradeId || undefined,
      unitId: (scope === "UNIT" || scope === "TOPIC") ? (unitId || undefined) : undefined,
      topicId: scope === "TOPIC" ? (topicId || undefined) : undefined,
      curriculumVersionId: versionId || undefined,
      timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
      maxAttempts: maxAttempts ? Number(maxAttempts) : null,
      randomizeQuestions,
      randomizeOptions,
      showResults,
      availableFrom: availableFrom ? new Date(availableFrom).toISOString() : null,
      availableUntil: availableUntil ? new Date(availableUntil).toISOString() : null,
    };

    await onSubmit(payload);
  };

  const typeOptions = ASSESSMENT_TYPES.map((t: AssessmentType) => ({
    value: t,
    label: ASSESSMENT_TYPE_LABELS[t],
  }));

  const gradingOptions = GRADING_MODES.map((g: GradingMode) => ({
    value: g,
    label: GRADING_MODE_LABELS[g],
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">
                {initialData ? "Edit Assessment" : "Create Assessment"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure test duration, grading rules, and attempt policies.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          <FormField
            label="Assessment Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grade 8 Linear Equations Midterm Assessment"
            required
            error={errors.title}
          />

          <FormField
            label="Description & Instructions (Optional)"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, required materials, or instructions for students..."
          />

          <div className="bg-muted/30 border border-border/70 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Layers size={15} className="text-primary" />
              <span>Academic Alignment</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Alignment Scope
              </label>
              <SelectDropdown
                options={ASSESSMENT_SCOPE_OPTIONS}
                value={scope}
                onChange={(val) => {
                  const newScope = val as AssessmentScopeOption;
                  setScope(newScope);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.subjectId;
                    delete next.gradeId;
                    delete next.unitId;
                    delete next.topicId;
                    return next;
                  });
                  if (newScope === "GENERAL") {
                    setUnitId("");
                    setTopicId("");
                  } else if (newScope === "SUBJECT") {
                    setGradeId("");
                    setUnitId("");
                    setTopicId("");
                  } else if (newScope === "GRADE_SUBJECT") {
                    setUnitId("");
                    setTopicId("");
                  } else if (newScope === "UNIT") {
                    setTopicId("");
                  }
                }}
              />
            </div>

            {scope === "GENERAL" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <SelectDropdown
                  label="Grade Level (Optional)"
                  options={gradeOptions}
                  value={gradeId}
                  onChange={(val) => {
                    setGradeId(val);
                    setUnitId("");
                    setTopicId("");
                  }}
                />

                <SelectDropdown
                  label="Subject (Optional)"
                  options={availableSubjectOptions}
                  value={subjectId}
                  onChange={(val) => {
                    setSubjectId(val);
                    setUnitId("");
                    setTopicId("");
                  }}
                />
              </div>
            )}

            {scope === "SUBJECT" && (
              <div className="pt-1">
                <SelectDropdown
                  label="Subject *"
                  options={availableSubjectOptions.filter((s) => s.value !== "")}
                  value={subjectId}
                  onChange={(val) => {
                    setSubjectId(val);
                    setUnitId("");
                    setTopicId("");
                  }}
                  error={errors.subjectId}
                  placeholder="Select Subject"
                />
              </div>
            )}

            {(scope === "GRADE_SUBJECT" || scope === "UNIT" || scope === "TOPIC") && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectDropdown
                    label="Grade Level *"
                    options={gradeOptions.filter((g) => g.value !== "")}
                    value={gradeId}
                    onChange={(val) => {
                      setGradeId(val);
                      setUnitId("");
                      setTopicId("");
                    }}
                    error={errors.gradeId}
                    placeholder="Select Grade"
                  />

                  <SelectDropdown
                    label="Subject *"
                    options={availableSubjectOptions.filter((s) => s.value !== "")}
                    value={subjectId}
                    onChange={(val) => {
                      setSubjectId(val);
                      setUnitId("");
                      setTopicId("");
                    }}
                    error={errors.subjectId}
                    placeholder={gradeId ? "Select Subject" : "Select grade first"}
                    disabled={!gradeId}
                  />
                </div>

                {scope === "UNIT" && (
                  <div>
                    <SelectDropdown
                      label="Unit *"
                      options={unitOptions.filter((u) => u.value !== "")}
                      value={unitId}
                      onChange={(val) => {
                        setUnitId(val);
                        setTopicId("");
                      }}
                      error={errors.unitId}
                      disabled={!curriculumSubjectId || units.length === 0}
                      placeholder={
                        !subjectId
                          ? "Select subject first"
                          : units.length === 0
                          ? "No units found for this subject"
                          : "Select Unit"
                      }
                    />
                  </div>
                )}

                {scope === "TOPIC" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectDropdown
                      label="Unit *"
                      options={unitOptions.filter((u) => u.value !== "")}
                      value={unitId}
                      onChange={(val) => {
                        setUnitId(val);
                        setTopicId("");
                      }}
                      error={errors.unitId}
                      disabled={!curriculumSubjectId || units.length === 0}
                      placeholder={
                        !subjectId
                          ? "Select subject first"
                          : units.length === 0
                          ? "No units found"
                          : "Select Unit"
                      }
                    />

                    <SelectDropdown
                      label="Topic *"
                      options={topicOptions.filter((t) => t.value !== "")}
                      value={topicId}
                      onChange={setTopicId}
                      error={errors.topicId}
                      disabled={!unitId || topics.length === 0}
                      placeholder={
                        !unitId
                          ? "Select unit first"
                          : topics.length === 0
                          ? "No topics found"
                          : "Select Topic"
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Assessment Type
              </label>
              <SelectDropdown
                options={typeOptions}
                value={type}
                onChange={(val) => setType(val as AssessmentType)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Grading Mode
              </label>
              <SelectDropdown
                options={gradingOptions}
                value={gradingMode}
                onChange={(val) => setGradingMode(val as GradingMode)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Time Limit (Minutes)"
              name="timeLimitMinutes"
              type="number"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value)}
              placeholder="e.g. 45 (Leave empty for untimed)"
            />

            <FormField
              label="Max Attempts Allowed"
              name="maxAttempts"
              type="number"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatePicker
              label="Available From (Optional)"
              value={availableFrom}
              onChange={setAvailableFrom}
              showEthiopianReference
            />

            <DatePicker
              label="Available Until (Optional)"
              value={availableUntil}
              onChange={setAvailableUntil}
              min={availableFrom || undefined}
              showEthiopianReference
              align="right"
              error={errors.availableUntil}
            />
          </div>

          <div className="pt-2 border-t border-border space-y-2.5">
            <span className="text-xs font-semibold text-foreground block">
              Test Security & Delivery Options
            </span>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={randomizeQuestions}
                onChange={(e) => setRandomizeQuestions(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>Randomize question order for each student</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={randomizeOptions}
                onChange={(e) => setRandomizeOptions(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>Randomize answer choice options</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showResults}
                onChange={(e) => setShowResults(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>Display instant score & result breakdown upon completion</span>
            </label>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isLoading}
              size="sm"
              className="w-auto"
            >
              {initialData ? "Update Assessment" : "Create Assessment"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
