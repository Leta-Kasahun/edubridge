"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, Layers } from "lucide-react";
import {
  LearningContentListItem,
  LearningContentDetailItem,
  ContentType,
  CreateLearningContentDto,
} from "../../types/content.types";
import {
  useCreateContent,
  useUpdateContentMetadata,
  useUpdateContentMappings,
} from "../../hooks/useLearningContent";
import {
  useCurricula,
  useCurriculumDetails,
} from "@/features/curriculum/curricula/hooks/useCurricula";
import {
  useCurriculumSubjects,
  useCurriculumUnits,
  useCurriculumTopics,
  useLearningObjectives,
} from "@/features/curriculum/structure/hooks/useStructure";
import {
  SelectDropdown,
  SelectDropdownOption,
  ErrorAlert,
  SubmitButton,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface ContentFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly itemToEdit?: LearningContentListItem | LearningContentDetailItem | null;
}

const CONTENT_TYPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "LESSON", label: "Lesson / Course Module" },
  { value: "PDF", label: "PDF Document / Textbook" },
  { value: "VIDEO", label: "Video Material" },
  { value: "NOTE", label: "Study Note / Summary" },
  { value: "IMAGE", label: "Image / Infographic" },
  { value: "LINK", label: "Web Resource Link" },
  { value: "TEXT", label: "Text / Reading Material" },
];

export function ContentFormModal({
  isOpen,
  onClose,
  itemToEdit,
}: ContentFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ContentType>("LESSON");
  const [initialText, setInitialText] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [changeNote, setChangeNote] = useState("");

  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedObjectiveIds, setSelectedObjectiveIds] = useState<string[]>([]);

  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateContent();
  const updateMetadataMutation = useUpdateContentMetadata(itemToEdit?.id || "");
  const updateMappingsMutation = useUpdateContentMappings(itemToEdit?.id || "");

  const isEditing = Boolean(itemToEdit);

  const { data: curriculaData } = useCurricula({ limit: 100 });
  const curricula = curriculaData?.data ?? [];

  const { data: curriculumDetail } = useCurriculumDetails(
    selectedCurriculumId || null
  );
  const versions = curriculumDetail?.versions ?? [];

  const { data: subjects = [] } = useCurriculumSubjects(selectedVersionId);
  const { data: units = [] } = useCurriculumUnits(
    selectedSubjectId,
    Boolean(selectedSubjectId)
  );
  const { data: topics = [] } = useCurriculumTopics(
    selectedUnitId,
    Boolean(selectedUnitId)
  );
  const { data: objectives = [] } = useLearningObjectives(
    selectedTopicId,
    Boolean(selectedTopicId)
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
        setChangeNote("");
        if ("primaryTopic" in itemToEdit && itemToEdit.primaryTopic) {
          setSelectedTopicId(itemToEdit.primaryTopic.topicId);
        } else if ("topics" in itemToEdit && itemToEdit.topics.length > 0) {
          setSelectedTopicId(itemToEdit.topics[0]?.topicId || "");
        }
      } else {
        setTitle("");
        setDescription("");
        setType("LESSON");
        setInitialText("");
        setResourceUrl("");
        setChangeNote("");
        setSelectedTopicId("");
        setSelectedObjectiveIds([]);
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
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0]?.id || "");
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (units.length > 0 && !selectedUnitId) {
      setSelectedUnitId(units[0]?.id || "");
    }
  }, [units, selectedUnitId]);

  if (!isOpen || !mounted) return null;

  const curriculumOptions: SelectDropdownOption[] = curricula.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const versionOptions: SelectDropdownOption[] = versions.map((v) => ({
    value: v.id,
    label: `${v.name} (${v.code})`,
  }));

  const subjectOptions: SelectDropdownOption[] = subjects.map((s) => ({
    value: s.id,
    label: s.subjectName || s.id,
  }));

  const unitOptions: SelectDropdownOption[] = units.map((u) => ({
    value: u.id,
    label: `${u.code}: ${u.title}`,
  }));

  const topicOptions: SelectDropdownOption[] = topics.map((t) => ({
    value: t.id,
    label: `${t.code}: ${t.title}`,
  }));

  const toggleObjective = (id: string) => {
    setSelectedObjectiveIds((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Title is required");
      return;
    }

    if (!isEditing && !selectedTopicId) {
      setFormError("A primary curriculum topic mapping is required");
      return;
    }

    try {
      if (isEditing && itemToEdit) {
        await updateMetadataMutation.mutateAsync({
          title: title.trim(),
          description: description.trim() || null,
          type,
        });

        if (selectedTopicId) {
          await updateMappingsMutation.mutateAsync({
            primaryTopicId: selectedTopicId,
            objectiveIds: selectedObjectiveIds,
          });
        }
      } else {
        const payload: CreateLearningContentDto = {
          title: title.trim(),
          description: description.trim() || null,
          type,
          primaryTopicId: selectedTopicId,
          objectiveIds: selectedObjectiveIds,
          initialVersionBody: {
            text: initialText.trim(),
            resourceUrl: resourceUrl.trim() || null,
            attachmentIds: [],
          },
          changeNote: changeNote.trim() || "Initial creation",
        };

        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMetadataMutation.isPending ||
    updateMappingsMutation.isPending;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 min-w-0 flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                {isEditing ? "Edit Material" : "Create Learning Material"}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {isEditing
                  ? "Update content attributes and curriculum linkages"
                  : "Add textbook, lesson, or resource linked to curriculum"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs"
        >
          {formError && <ErrorAlert message={formError} />}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Material Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Structure of the Atom & Chemical Bonding"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Content Type <span className="text-destructive">*</span>
              </label>
              <SelectDropdown
                options={CONTENT_TYPE_OPTIONS}
                value={type}
                onChange={(val) => setType(val as ContentType)}
                placeholder="Select material type"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Resource Link (Optional)
              </label>
              <input
                type="url"
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                placeholder="https://example.com/resource"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of learning material..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="bg-muted/20 border border-border rounded-xl p-3.5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Layers size={14} className="text-primary" />
              <span>Curriculum Structure Alignment</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Curriculum
                </label>
                <SelectDropdown
                  options={curriculumOptions}
                  value={selectedCurriculumId}
                  onChange={(val) => {
                    setSelectedCurriculumId(val);
                    setSelectedSubjectId("");
                    setSelectedUnitId("");
                    setSelectedTopicId("");
                  }}
                  placeholder="Select curriculum"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Version
                </label>
                <SelectDropdown
                  options={versionOptions}
                  value={selectedVersionId}
                  onChange={(val) => {
                    setSelectedVersionId(val);
                    setSelectedSubjectId("");
                    setSelectedUnitId("");
                    setSelectedTopicId("");
                  }}
                  placeholder="Select version"
                  disabled={versions.length === 0}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Subject
                </label>
                <SelectDropdown
                  options={subjectOptions}
                  value={selectedSubjectId}
                  onChange={(val) => {
                    setSelectedSubjectId(val);
                    setSelectedUnitId("");
                    setSelectedTopicId("");
                  }}
                  placeholder="Select subject"
                  disabled={subjects.length === 0}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Unit
                </label>
                <SelectDropdown
                  options={unitOptions}
                  value={selectedUnitId}
                  onChange={(val) => {
                    setSelectedUnitId(val);
                    setSelectedTopicId("");
                  }}
                  placeholder="Select unit"
                  disabled={units.length === 0}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">
                Primary Topic <span className="text-destructive">*</span>
              </label>
              <SelectDropdown
                options={topicOptions}
                value={selectedTopicId}
                onChange={(val) => setSelectedTopicId(val)}
                placeholder="Select topic"
                disabled={topics.length === 0}
              />
            </div>

            {objectives.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-[11px] font-semibold text-foreground">
                  Mapped Learning Objectives (Optional)
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {objectives.map((obj) => {
                    const isChecked = selectedObjectiveIds.includes(obj.id);
                    return (
                      <label
                        key={obj.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-primary/10 border-primary/30 text-foreground"
                            : "bg-card border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleObjective(obj.id)}
                          className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-primary mr-1.5">
                            {obj.code}:
                          </span>
                          <span className="text-foreground">{obj.statement}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Initial Content Body Text (Optional)
              </label>
              <textarea
                value={initialText}
                onChange={(e) => setInitialText(e.target.value)}
                placeholder="Initial lesson text, notes, instructions..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer text-xs font-medium"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isSubmitting}
              loadingText={isEditing ? "Saving..." : "Creating..."}
              size="sm"
            >
              {isEditing ? "Save Changes" : "Create Material"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
