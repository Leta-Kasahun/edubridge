"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Sliders } from "lucide-react";
import { FormField } from "@/shared/components/FormField";
import { SelectDropdown } from "@/shared/components/SelectDropdown";
import { SubmitButton } from "@/shared/components/SubmitButton";
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

interface AssessmentFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (
    payload: CreateAssessmentPayload | UpdateAssessmentPayload
  ) => Promise<void>;
  readonly initialData?: AssessmentItem | null;
  readonly isLoading?: boolean;
}

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
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<string>("");
  const [maxAttempts, setMaxAttempts] = useState<string>("1");
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setType(initialData.type);
      setGradingMode(initialData.gradingMode);
      setTimeLimitMinutes(
        initialData.timeLimitMinutes ? String(initialData.timeLimitMinutes) : ""
      );
      setMaxAttempts(
        initialData.maxAttempts ? String(initialData.maxAttempts) : ""
      );
      setRandomizeQuestions(initialData.randomizeQuestions);
      setRandomizeOptions(initialData.randomizeOptions);
      setShowResults(initialData.showResults);
      setAvailableFrom(
        initialData.availableFrom
          ? new Date(initialData.availableFrom).toISOString().slice(0, 16)
          : ""
      );
      setAvailableUntil(
        initialData.availableUntil
          ? new Date(initialData.availableUntil).toISOString().slice(0, 16)
          : ""
      );
    } else {
      setTitle("");
      setDescription("");
      setType("QUIZ");
      setGradingMode("AUTOMATIC");
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
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Available From (Optional)
              </label>
              <input
                type="datetime-local"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Available Until / Due (Optional)
              </label>
              <input
                type="datetime-local"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
              {errors.availableUntil && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.availableUntil}</p>
              )}
            </div>
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
              <span>Randomize answer choice options (MCQ / True-False)</span>
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
