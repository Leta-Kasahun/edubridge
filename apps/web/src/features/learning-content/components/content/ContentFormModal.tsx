"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, Layers, UploadCloud, File, Trash2, Send, Globe } from "lucide-react";
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
  useSubmitContent,
  usePublishContent,
} from "../../hooks/useLearningContent";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import {
  CurriculumSelector,
  CurriculumSelectionValue,
} from "@/features/curriculum/components/CurriculumSelector";
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
  const [initialText, setInitialText] = useState("");
  const [changeNote, setChangeNote] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedGradeLevels, setSelectedGradeLevels] = useState<number[]>([]);

  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedObjectiveIds, setSelectedObjectiveIds] = useState<readonly string[]>([]);
  const [curriculumSelection, setCurriculumSelection] = useState<CurriculumSelectionValue>({});

  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateContent();
  const updateMetadataMutation = useUpdateContentMetadata(itemToEdit?.id || "");
  const uploadAttachmentMutation = useUploadContentAttachment();
  const submitMutation = useSubmitContent();
  const publishMutation = usePublishContent();

  const isEditing = Boolean(itemToEdit);
  const isPending =
    createMutation.isPending ||
    updateMetadataMutation.isPending ||
    uploadAttachmentMutation.isPending ||
    submitMutation.isPending ||
    publishMutation.isPending;

  const isTextbookOrRef = type === "TEXTBOOK" || type === "REFERENCE_BOOK";

  const { data: rawSubjectsList = [] } = useSubjects();
  const { data: rawGradesList = [] } = useGrades();

  const subjectsList = rawSubjectsList.filter((s) =>
    !allowedSubjectIds || allowedSubjectIds.length === 0 || allowedSubjectIds.includes(s.id)
  );

  const gradesList = rawGradesList.filter((g) =>
    !allowedGradeIds || allowedGradeIds.length === 0 || allowedGradeIds.includes(g.id)
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
        setChangeNote("");

        if (itemToEdit.targetGradeLevels && itemToEdit.targetGradeLevels.length > 0) {
          setSelectedGradeLevels([...itemToEdit.targetGradeLevels]);
        } else if (itemToEdit.gradeLevel) {
          setSelectedGradeLevels([itemToEdit.gradeLevel]);
        } else {
          setSelectedGradeLevels([]);
        }

        const primaryTopicId =
          "primaryTopic" in itemToEdit && itemToEdit.primaryTopic
            ? itemToEdit.primaryTopic.topicId
            : "topics" in itemToEdit && itemToEdit.topics.length > 0
            ? itemToEdit.topics[0]?.topicId || ""
            : "";

        setSelectedTopicId(primaryTopicId);
        setCurriculumSelection({
          subjectId: itemToEdit.subjectId || undefined,
          gradeId: itemToEdit.gradeId || undefined,
          unitId: itemToEdit.unitId || undefined,
          topicId: primaryTopicId || undefined,
        });
      } else {
        setTitle("");
        setDescription("");
        setType("LESSON");
        setScope("TOPIC");
        setSelectedSubjectId("");
        setSelectedGradeId("");
        setSelectedGradeLevels([]);
        setSelectedUnitId("");
        setSelectedTopicId("");
        setSelectedObjectiveIds([]);
        setCurriculumSelection({});
        setInitialText("");
        setChangeNote("");
        setSelectedFiles([]);
      }
    }
  }, [isOpen, itemToEdit]);

  if (!mounted || !isOpen) return null;

  const subjectOptions: readonly SelectDropdownOption[] = subjectsList.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  }));

  const gradeOptions: readonly SelectDropdownOption[] = gradesList.map((g) => ({
    value: g.id,
    label: `Grade ${g.level}`,
  }));

  const availableGradeLevels =
    gradesList.length > 0
      ? gradesList.map((g) => g.level).sort((a, b) => a - b)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const toggleGradeLevel = (level: number) => {
    setSelectedGradeLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level].sort((a, b) => a - b)
    );
  };

  const handleSelectGradeBand = (levels: readonly number[]) => {
    setSelectedGradeLevels((prev) => {
      const allSelected = levels.every((l) => prev.includes(l));
      if (allSelected) {
        return prev.filter((l) => !levels.includes(l));
      }
      return Array.from(new Set([...prev, ...levels])).sort((a, b) => a - b);
    });
  };

  const isReferenceBook = type === "REFERENCE_BOOK";

  const handleCurriculumChange = (val: CurriculumSelectionValue) => {
    setCurriculumSelection(val);
    if (val.subjectId) setSelectedSubjectId(val.subjectId);
    if (val.gradeId) setSelectedGradeId(val.gradeId);
    if (val.unitId) setSelectedUnitId(val.unitId);
    if (val.topicId) setSelectedTopicId(val.topicId);
    if (val.objectiveIds) setSelectedObjectiveIds(val.objectiveIds);
  };

  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const added = Array.from(newFiles);
    setSelectedFiles((prev) => [...prev, ...added]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const executeSubmit = async (action: "DRAFT" | "PUBLISH" | "SUBMIT") => {
    setFormError(null);

    if (!title.trim()) {
      setFormError("Material title is required.");
      return;
    }

    const sortedGradeLevels = [...selectedGradeLevels].sort((a, b) => a - b);
    let resolvedGradeId = selectedGradeId;

    if (!resolvedGradeId && sortedGradeLevels.length > 0) {
      const match = rawGradesList.find((g) => g.level === sortedGradeLevels[0]);
      if (match) {
        resolvedGradeId = match.id;
      }
    }

    if (scope === "SUBJECT" && !selectedSubjectId) {
      setFormError("Please select a subject.");
      return;
    }

    if (isReferenceBook && sortedGradeLevels.length === 0 && !resolvedGradeId) {
      setFormError("Please select at least one grade level for the reference book.");
      return;
    }

    if (!isReferenceBook && scope === "GRADE_SUBJECT") {
      if (!resolvedGradeId) {
        setFormError("Please select a grade.");
        return;
      }
      if (!selectedSubjectId) {
        setFormError("Please select a subject.");
        return;
      }
    }

    if (scope === "UNIT" && !selectedUnitId) {
      setFormError("Please select a curriculum unit.");
      return;
    }

    if (scope === "TOPIC" && !selectedTopicId) {
      setFormError("Please select a curriculum topic.");
      return;
    }

    try {
      if (isEditing && itemToEdit) {
        const updatePayload: UpdateLearningContentDto = {
          title: title.trim(),
          description: description.trim() || null,
          type,
          scope,
          subjectId: selectedSubjectId || null,
          gradeId: resolvedGradeId || null,
          unitId: selectedUnitId || null,
          targetGradeLevels: sortedGradeLevels,
        };

        await updateMetadataMutation.mutateAsync(updatePayload);
      } else {
        const createPayload: CreateLearningContentDto = {
          title: title.trim(),
          description: description.trim() || null,
          type,
          scope,
          source: "TEACHER",
          subjectId: selectedSubjectId || undefined,
          gradeId: resolvedGradeId || undefined,
          unitId: selectedUnitId || undefined,
          targetGradeLevels: sortedGradeLevels,
          primaryTopicId: scope === "TOPIC" ? selectedTopicId : undefined,
          secondaryTopicIds: [],
          objectiveIds: scope === "TOPIC" ? selectedObjectiveIds : [],
          initialVersionBody: initialText.trim() ? { text: initialText.trim() } : undefined,
          changeNote: changeNote.trim() || undefined,
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

        if (action === "PUBLISH") {
          await publishMutation.mutateAsync(created.id);
        } else if (action === "SUBMIT") {
          await submitMutation.mutateAsync(created.id);
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {isEditing ? "Edit Learning Material" : "Create Learning Material"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {isEditing
                  ? "Update metadata and associations"
                  : "Author new teaching and learning content"}
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditing) {
              executeSubmit("DRAFT");
            } else if (isTextbookOrRef) {
              executeSubmit("SUBMIT");
            } else {
              executeSubmit("PUBLISH");
            }
          }}
          className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto"
        >
          {formError && <ErrorAlert message={formError} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Content Type <span className="text-destructive">*</span>
              </label>
              <SelectDropdown
                options={CONTENT_TYPE_OPTIONS}
                value={type}
                onChange={(val) => setType(val as ContentType)}
                placeholder="Select content type"
                disabled={isEditing}
              />
              {isTextbookOrRef && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  Textbooks and reference books require School Admin review before publishing.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Curriculum Scope <span className="text-destructive">*</span>
              </label>
              <SelectDropdown
                options={CONTENT_SCOPE_OPTIONS}
                value={scope}
                onChange={(val) => {
                  setScope(val as ContentScope);
                  setSelectedUnitId("");
                  setSelectedTopicId("");
                  setSelectedObjectiveIds([]);
                }}
                placeholder="Select scope"
                disabled={isEditing}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/70 bg-muted/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Layers size={14} className="text-primary" />
              <span>Curriculum Alignment</span>
            </div>

            {isReferenceBook && (
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

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-muted-foreground">
                    <span>Applicable Grade Levels</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectGradeBand([9, 10])}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
                      >
                        Grades 9 - 10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectGradeBand([11, 12])}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
                      >
                        Grades 11 - 12
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedGradeLevels([...availableGradeLevels])}
                        className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors cursor-pointer"
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

            {scope === "GRADE_SUBJECT" && !isReferenceBook && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Grade <span className="text-destructive">*</span>
                  </label>
                  <SelectDropdown
                    options={gradeOptions}
                    value={selectedGradeId}
                    onChange={setSelectedGradeId}
                    placeholder="Select grade"
                  />
                </div>
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
              </div>
            )}

            {(scope === "UNIT" || scope === "TOPIC") && (
              <div className="space-y-3 pt-1">
                <CurriculumSelector
                  value={curriculumSelection}
                  onChange={handleCurriculumChange}
                  minLevel={scope === "UNIT" ? "UNIT" : "TOPIC"}
                  multiObjective={true}
                  allowedSubjectIds={allowedSubjectIds}
                  allowedGradeIds={allowedGradeIds}
                />
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
              placeholder="e.g. Physics Grade 9-12 or Unit 2 Review"
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
              placeholder="Brief overview or description..."
              className="w-full p-3 text-xs bg-muted/30 focus:bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors resize-none"
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Attach Files
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

          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Summary Notes
              </label>
              <textarea
                rows={2}
                value={initialText}
                onChange={(e) => setInitialText(e.target.value)}
                placeholder="Notes or instructions..."
                className="w-full p-3 text-xs bg-muted/30 focus:bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors resize-none"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            {isEditing ? (
              <SubmitButton
                isLoading={isPending}
                loadingText="Saving..."
                size="sm"
              >
                Save Changes
              </SubmitButton>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => executeSubmit("DRAFT")}
                  className="flex-1 sm:flex-none h-9 px-3.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save as Draft
                </button>

                {isTextbookOrRef ? (
                  <SubmitButton
                    isLoading={isPending}
                    loadingText="Submitting..."
                    size="sm"
                    onClick={() => executeSubmit("SUBMIT")}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Send size={13} />
                      Submit for Review
                    </span>
                  </SubmitButton>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => executeSubmit("SUBMIT")}
                      className="h-9 px-3 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                      title="Optionally request review before publishing"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Send size={12} />
                        Request Review
                      </span>
                    </button>
                    <SubmitButton
                      isLoading={isPending}
                      loadingText="Publishing..."
                      size="sm"
                      onClick={() => executeSubmit("PUBLISH")}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Globe size={13} />
                        Publish Material
                      </span>
                    </SubmitButton>
                  </>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
