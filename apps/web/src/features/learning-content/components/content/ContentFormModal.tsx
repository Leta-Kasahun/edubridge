"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, Layers, UploadCloud, File, Trash2 } from "lucide-react";
import {
  LearningContentListItem,
  LearningContentDetailItem,
  ContentType,
  ContentScope,
  CreateLearningContentDto,
  UpdateLearningContentDto,
} from "../../types/content.types";
import {
  useCreateContent,
  useUpdateContentMetadata,
  useUploadContentAttachment,
} from "../../hooks/useLearningContent";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
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
  SelectDropdown,
  SelectDropdownOption,
  ErrorAlert,
  SubmitButton,
} from "@/shared/components";
import { getErrorMessage, formatFileSize } from "@/shared/utils";

interface ContentFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly itemToEdit?: LearningContentListItem | LearningContentDetailItem | null;
  readonly allowedSubjectIds?: readonly string[];
  readonly allowedGradeIds?: readonly string[];
  readonly onContentCreated?: () => void;
}

const CONTENT_SCOPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "SUBJECT", label: "Subject" },
  { value: "GRADE_SUBJECT", label: "Grade" },
  { value: "UNIT", label: "Unit" },
  { value: "TOPIC", label: "Topic" },
];

const CONTENT_TYPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "TEXTBOOK", label: "Textbook" },
  { value: "REFERENCE_BOOK", label: "Reference Book" },
  { value: "WORKSHEET", label: "Worksheet" },
  { value: "LESSON", label: "Lesson" },
  { value: "EXERCISE", label: "Exercise" },
  { value: "PAST_EXAM_PAPER", label: "Past Exam" },
  { value: "TEACHER_GUIDE", label: "Teacher Guide" },
  { value: "STUDY_GUIDE", label: "Study Guide" },
  { value: "VIDEO", label: "Video" },
  { value: "PDF", label: "PDF" },
  { value: "NOTE", label: "Note" },
  { value: "IMAGE", label: "Image" },
  { value: "LINK", label: "Link" },
  { value: "TEXT", label: "Text" },
];

const GRADE_BANDS: readonly { label: string; levels: readonly number[] }[] = [
  { label: "Grades 7 & 8", levels: [7, 8] },
  { label: "Grades 9 & 10", levels: [9, 10] },
  { label: "Grades 11 & 12", levels: [11, 12] },
];

export function ContentFormModal({
  isOpen,
  onClose,
  itemToEdit,
  allowedSubjectIds,
  allowedGradeIds,
  onContentCreated,
}: ContentFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<ContentScope>("TOPIC");
  const [type, setType] = useState<ContentType>("LESSON");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedGradeLevels, setSelectedGradeLevels] = useState<number[]>([]);

  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [selectedCurriculumSubjectId, setSelectedCurriculumSubjectId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateContent();
  const updateMetadataMutation = useUpdateContentMetadata(itemToEdit?.id || "");
  const uploadAttachmentMutation = useUploadContentAttachment();

  const isEditing = Boolean(itemToEdit);

  const { data: subjectsList = [] } = useSubjects();
  const { data: gradesList = [] } = useGrades();

  const { data: curriculaData } = useCurricula({ limit: 100 });
  const curricula = curriculaData?.data ?? [];

  const { data: curriculumDetail } = useCurriculumDetails(
    selectedCurriculumId || null
  );
  const versions = curriculumDetail?.versions ?? [];

  const { data: curriculumSubjects = [] } = useCurriculumSubjects(selectedVersionId);
  const { data: units = [] } = useCurriculumUnits(
    selectedCurriculumSubjectId,
    Boolean(selectedCurriculumSubjectId)
  );
  const { data: topics = [] } = useCurriculumTopics(
    selectedUnitId,
    Boolean(selectedUnitId)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (itemToEdit) {
        setTitle(itemToEdit.title);
        setDescription(itemToEdit.description || "");
        setType(itemToEdit.type);
        setScope(itemToEdit.scope || "TOPIC");
        setSelectedSubjectId(itemToEdit.subjectId || "");
        setSelectedGradeId(itemToEdit.gradeId || "");
        setSelectedUnitId(itemToEdit.unitId || "");

        if (itemToEdit.targetGradeLevels && itemToEdit.targetGradeLevels.length > 0) {
          setSelectedGradeLevels([...itemToEdit.targetGradeLevels]);
        } else if (itemToEdit.gradeLevel) {
          setSelectedGradeLevels([itemToEdit.gradeLevel]);
        } else {
          setSelectedGradeLevels([]);
        }

        if ("primaryTopic" in itemToEdit && itemToEdit.primaryTopic) {
          setSelectedTopicId(itemToEdit.primaryTopic.topicId);
        } else if ("topics" in itemToEdit && itemToEdit.topics && itemToEdit.topics.length > 0) {
          setSelectedTopicId(itemToEdit.topics[0]?.topicId || "");
        }
      } else {
        setTitle("");
        setDescription("");
        setType("LESSON");
        setScope("TOPIC");
        setSelectedSubjectId("");
        setSelectedGradeId("");
        setSelectedGradeLevels([]);
        setSelectedCurriculumSubjectId("");
        setSelectedUnitId("");
        setSelectedTopicId("");
        setSelectedFiles([]);
      }
    }
  }, [isOpen, itemToEdit]);

  useEffect(() => {
    if (!selectedCurriculumId && curricula.length > 0) {
      setSelectedCurriculumId(curricula[0]?.id || "");
    }
  }, [curricula, selectedCurriculumId]);

  useEffect(() => {
    if (versions.length > 0) {
      const activeOrDraft =
        versions.find((v) => v.status === "ACTIVE") ||
        versions.find((v) => v.status === "DRAFT") ||
        versions[0];
      if (activeOrDraft) {
        setSelectedVersionId(activeOrDraft.id);
      }
    } else {
      setSelectedVersionId("");
    }
  }, [versions]);

  useEffect(() => {
    if (selectedGradeId && selectedSubjectId && curriculumSubjects.length > 0) {
      const match = curriculumSubjects.find(
        (cs) => cs.gradeId === selectedGradeId && cs.subjectId === selectedSubjectId
      );
      if (match) {
        setSelectedCurriculumSubjectId(match.id);
      } else {
        setSelectedCurriculumSubjectId("");
      }
    } else if (!selectedGradeId || !selectedSubjectId) {
      setSelectedCurriculumSubjectId("");
    }
  }, [selectedGradeId, selectedSubjectId, curriculumSubjects]);

  const filteredSubjectsList =
    allowedSubjectIds && allowedSubjectIds.length > 0
      ? subjectsList.filter((s) => allowedSubjectIds.includes(s.id))
      : subjectsList;

  const filteredGradesList =
    allowedGradeIds && allowedGradeIds.length > 0
      ? gradesList.filter((g) => allowedGradeIds.includes(g.id))
      : gradesList;

  const filteredCurriculumSubjects = curriculumSubjects.filter((cs) => {
    if (
      allowedSubjectIds &&
      allowedSubjectIds.length > 0 &&
      !allowedSubjectIds.includes(cs.subjectId)
    ) {
      return false;
    }
    if (
      allowedGradeIds &&
      allowedGradeIds.length > 0 &&
      !allowedGradeIds.includes(cs.gradeId)
    ) {
      return false;
    }
    return true;
  });

  const gradeOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return filteredGradesList
      .slice()
      .sort((a, b) => a.level - b.level)
      .map((g) => ({
        value: g.id,
        label: `Grade ${g.level}`,
      }));
  }, [filteredGradesList]);

  const availableSubjectOptions: readonly SelectDropdownOption[] = useMemo(() => {
    let subjects = filteredSubjectsList;

    if (selectedGradeId && curriculumSubjects.length > 0) {
      const subjectIdsForGrade = new Set(
        curriculumSubjects
          .filter((cs) => cs.gradeId === selectedGradeId)
          .map((cs) => cs.subjectId)
      );
      if (subjectIdsForGrade.size > 0) {
        subjects = filteredSubjectsList.filter((s) => subjectIdsForGrade.has(s.id));
      }
    }

    return subjects.map((s) => ({
      value: s.id,
      label: s.code ? `${s.code} - ${s.name}` : s.name,
    }));
  }, [filteredSubjectsList, selectedGradeId, curriculumSubjects]);

  const subjectOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return filteredSubjectsList.map((s) => ({
      value: s.id,
      label: s.code ? `${s.code} - ${s.name}` : s.name,
    }));
  }, [filteredSubjectsList]);

  const unitOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return units.map((u) => ({
      value: u.id,
      label: u.code ? `${u.code}: ${u.title}` : u.title,
    }));
  }, [units]);

  const topicOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return topics.map((t) => ({
      value: t.id,
      label: t.code ? `${t.code}: ${t.title}` : t.title,
    }));
  }, [topics]);

  const availableGradeLevels =
    filteredGradesList.length > 0
      ? filteredGradesList.map((g) => g.level).sort((a, b) => a - b)
      : gradesList.length > 0
      ? gradesList.map((g) => g.level).sort((a, b) => a - b)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const visibleGradeBands = GRADE_BANDS.filter((band) =>
    band.levels.some((lvl) => availableGradeLevels.includes(lvl))
  );

  const toggleGradeLevel = (level: number) => {
    setSelectedGradeLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level].sort((a, b) => a - b)
    );
  };

  const handleSelectGradeBand = (levels: readonly number[]) => {
    const validLevels = levels.filter((lvl) => availableGradeLevels.includes(lvl));
    setSelectedGradeLevels((prev) => {
      const allSelected = validLevels.every((l) => prev.includes(l));
      if (allSelected) {
        return prev.filter((l) => !validLevels.includes(l));
      }
      return Array.from(new Set([...prev, ...validLevels])).sort((a, b) => a - b);
    });
  };

  const isReferenceBook = type === "REFERENCE_BOOK";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    const sortedGradeLevels = [...selectedGradeLevels].sort((a, b) => a - b);
    let resolvedGradeId = selectedGradeId;

    if (!resolvedGradeId && sortedGradeLevels.length > 0) {
      const match = gradesList.find((g) => g.level === sortedGradeLevels[0]);
      if (match) {
        resolvedGradeId = match.id;
      }
    }

    let finalSubjectId = selectedSubjectId;
    let finalGradeId = resolvedGradeId;
    const finalUnitId = selectedUnitId;
    const finalTopicId = selectedTopicId;

    if (scope === "UNIT" || scope === "TOPIC") {
      if (selectedCurriculumSubjectId) {
        const matchedCs = curriculumSubjects.find((c) => c.id === selectedCurriculumSubjectId);
        if (matchedCs) {
          finalSubjectId = matchedCs.subjectId;
          finalGradeId = matchedCs.gradeId;
        }
      }
    }

    if (scope === "SUBJECT" && !finalSubjectId) {
      setFormError("Please select a subject.");
      return;
    }

    if (isReferenceBook && sortedGradeLevels.length === 0 && !finalGradeId) {
      setFormError("Please select at least one grade level.");
      return;
    }

    if (!isReferenceBook && (scope === "GRADE_SUBJECT" || scope === "UNIT" || scope === "TOPIC")) {
      if (!finalGradeId) {
        setFormError("Please select a grade.");
        return;
      }
      if (!finalSubjectId) {
        setFormError("Please select a subject.");
        return;
      }
    }

    if (scope === "UNIT" && !finalUnitId) {
      setFormError("Please select a unit.");
      return;
    }

    if (scope === "TOPIC" && !finalTopicId) {
      setFormError("Please select a topic.");
      return;
    }

    const calculatedGradeLevels =
      sortedGradeLevels.length > 0
        ? sortedGradeLevels
        : finalGradeId
        ? (() => {
            const match = gradesList.find((g) => g.id === finalGradeId);
            return match ? [match.level] : [];
          })()
        : [];

    try {
      if (isEditing && itemToEdit) {
        const updatePayload: UpdateLearningContentDto = {
          title: title.trim(),
          description: description.trim() || null,
          type,
          scope,
          subjectId: finalSubjectId || null,
          gradeId: finalGradeId || null,
          unitId: finalUnitId || null,
          curriculumVersionId: selectedVersionId || null,
          targetGradeLevels: calculatedGradeLevels,
        };

        await updateMetadataMutation.mutateAsync(updatePayload);
      } else {
        const createPayload: CreateLearningContentDto = {
          title: title.trim(),
          description: description.trim() || null,
          type,
          scope,
          source: "TEACHER",
          subjectId: finalSubjectId || undefined,
          gradeId: finalGradeId || undefined,
          unitId: finalUnitId || undefined,
          curriculumVersionId: selectedVersionId || undefined,
          targetGradeLevels: calculatedGradeLevels,
          primaryTopicId: scope === "TOPIC" ? finalTopicId : undefined,
          secondaryTopicIds: [],
          objectiveIds: [],
        };

        const created = await createMutation.mutateAsync(createPayload);

        if (selectedFiles.length > 0) {
          for (const file of selectedFiles) {
            await uploadAttachmentMutation.mutateAsync({
              contentId: created.id,
              file,
            });
          }
        }
      }

      if (onContentCreated) {
        onContentCreated();
      }
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to save learning material"));
    }
  };

  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const added = Array.from(newFiles);
    setSelectedFiles((prev) => [...prev, ...added]);

    if (!title.trim() && added[0]) {
      const cleanName = added[0].name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();
      setTitle(cleanName);
    }

    if (added[0]) {
      const ext = added[0].name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" && (type === "LESSON" || type === "TEXT")) {
        setType(scope === "SUBJECT" ? "REFERENCE_BOOK" : "TEXTBOOK");
      } else if ((ext === "mp4" || ext === "webm") && type !== "VIDEO") {
        setType("VIDEO");
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isPending =
    createMutation.isPending ||
    updateMetadataMutation.isPending ||
    uploadAttachmentMutation.isPending;

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden my-auto animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {isEditing ? "Edit Material" : "Upload Material"}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Academic alignment and material information
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {formError && <ErrorAlert message={formError} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Scope <span className="text-destructive">*</span>
              </label>
              <SelectDropdown
                options={CONTENT_SCOPE_OPTIONS}
                value={scope}
                onChange={(val) => setScope(val as ContentScope)}
                placeholder="Select scope"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Type <span className="text-destructive">*</span>
              </label>
              <SelectDropdown
                options={CONTENT_TYPE_OPTIONS}
                value={type}
                onChange={(val) => {
                  const newType = val as ContentType;
                  setType(newType);
                  if (
                    newType === "REFERENCE_BOOK" &&
                    (scope === "TOPIC" || scope === "UNIT")
                  ) {
                    setScope("GRADE_SUBJECT");
                  }
                }}
                placeholder="Select type"
              />
            </div>
          </div>

          <div className="bg-muted/30 border border-border/70 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Layers size={13} className="text-primary" />
              <span>Academic Alignment</span>
            </div>

            {(scope === "SUBJECT" || scope === "GRADE_SUBJECT") &&
              isReferenceBook && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Subject <span className="text-destructive">*</span>
                    </label>
                    <SelectDropdown
                      options={subjectOptions}
                      value={selectedSubjectId}
                      onChange={setSelectedSubjectId}
                      placeholder="Select subject"
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-foreground">
                        Target Grades <span className="text-destructive">*</span>
                      </label>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {selectedGradeLevels.length > 0
                          ? `Assigned: Grades ${selectedGradeLevels.join(", ")}`
                          : "Select multiple grades"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      {visibleGradeBands.map((band) => (
                        <button
                          key={band.label}
                          type="button"
                          onClick={() => handleSelectGradeBand(band.levels)}
                          className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
                        >
                          {band.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedGradeLevels([...availableGradeLevels])
                        }
                        className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors cursor-pointer ml-auto"
                      >
                        All
                      </button>
                      {selectedGradeLevels.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedGradeLevels([])}
                          className="px-2 py-0.5 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 pt-1">
                      {availableGradeLevels.map((lvl) => {
                        const isSelected = selectedGradeLevels.includes(lvl);
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => toggleGradeLevel(lvl)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-2xs scale-[1.02]"
                                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-muted/40"
                            }`}
                          >
                            Grade {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            {scope === "SUBJECT" && !isReferenceBook && (
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Subject <span className="text-destructive">*</span>
                </label>
                <SelectDropdown
                  options={subjectOptions}
                  value={selectedSubjectId}
                  onChange={setSelectedSubjectId}
                  placeholder="Select subject"
                />
              </div>
            )}

            {!isReferenceBook && scope !== "SUBJECT" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Grade <span className="text-destructive">*</span>
                    </label>
                    <SelectDropdown
                      options={gradeOptions}
                      value={selectedGradeId}
                      onChange={(val) => {
                        setSelectedGradeId(val);
                        setSelectedUnitId("");
                        setSelectedTopicId("");
                      }}
                      placeholder="Select grade"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Subject <span className="text-destructive">*</span>
                    </label>
                    <SelectDropdown
                      options={availableSubjectOptions}
                      value={selectedSubjectId}
                      onChange={(val) => {
                        setSelectedSubjectId(val);
                        setSelectedUnitId("");
                        setSelectedTopicId("");
                      }}
                      placeholder={selectedGradeId ? "Select subject" : "Select grade first"}
                      disabled={!selectedGradeId && availableSubjectOptions.length === 0}
                    />
                  </div>
                </div>

                {scope === "UNIT" && (
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Unit <span className="text-destructive">*</span>
                    </label>
                    <SelectDropdown
                      options={unitOptions}
                      value={selectedUnitId}
                      onChange={(val) => {
                        setSelectedUnitId(val);
                        setSelectedTopicId("");
                      }}
                      placeholder={
                        !selectedSubjectId
                          ? "Select subject first"
                          : unitOptions.length === 0
                          ? "No units available"
                          : "Select unit"
                      }
                      disabled={!selectedCurriculumSubjectId || unitOptions.length === 0}
                    />
                  </div>
                )}

                {scope === "TOPIC" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Unit <span className="text-destructive">*</span>
                      </label>
                      <SelectDropdown
                        options={unitOptions}
                        value={selectedUnitId}
                        onChange={(val) => {
                          setSelectedUnitId(val);
                          setSelectedTopicId("");
                        }}
                        placeholder={
                          !selectedSubjectId
                            ? "Select subject first"
                            : unitOptions.length === 0
                            ? "No units available"
                            : "Select unit"
                        }
                        disabled={!selectedCurriculumSubjectId || unitOptions.length === 0}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Topic <span className="text-destructive">*</span>
                      </label>
                      <SelectDropdown
                        options={topicOptions}
                        value={selectedTopicId}
                        onChange={setSelectedTopicId}
                        placeholder={
                          !selectedUnitId
                            ? "Select unit first"
                            : topicOptions.length === 0
                            ? "No topics available"
                            : "Select topic"
                        }
                        disabled={!selectedUnitId || topicOptions.length === 0}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full h-9 px-3 text-xs bg-muted/30 focus:bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full p-3 text-xs bg-muted/30 focus:bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors resize-none"
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Files
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileSelect(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-4 sm:p-5 border-2 border-dashed rounded-xl transition-all cursor-pointer text-center ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/60 bg-muted/20 hover:bg-primary/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4,.webm,.zip"
                  onChange={(e) => {
                    handleFileSelect(e.target.files);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="hidden"
                />
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1.5">
                  <UploadCloud size={16} />
                </div>
                <p className="text-xs font-medium text-foreground">
                  Click to select or drop files here
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Files up to 100MB
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedFiles.map((f, i) => (
                    <div
                      key={`${f.name}-${f.size}-${i}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <File size={13} className="text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground truncate text-xs">
                          {f.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          ({formatFileSize(f.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(i)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isPending}
              loadingText={isEditing ? "Saving..." : "Uploading..."}
              size="sm"
            >
              {isEditing ? "Save" : "Upload"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
