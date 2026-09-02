"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Layers } from "lucide-react";
import {
  CurriculumItem,
  CurriculumVersionItem,
  CreateCurriculumVersionPayload,
  UpdateCurriculumVersionPayload,
} from "../types/curriculum.types";
import {
  useCreateCurriculumVersion,
  useUpdateCurriculumVersion,
} from "../hooks/useCurricula";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface CurriculumVersionFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly curriculum: CurriculumItem | null;
  readonly versionToEdit?: CurriculumVersionItem | null;
}

export function CurriculumVersionFormModal({
  isOpen,
  onClose,
  curriculum,
  versionToEdit,
}: CurriculumVersionFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [externalId, setExternalId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const curriculumId = curriculum?.id ?? "";
  const createMutation = useCreateCurriculumVersion(curriculumId);
  const updateMutation = useUpdateCurriculumVersion(
    curriculumId,
    versionToEdit?.id ?? ""
  );

  const isEditing = Boolean(versionToEdit);
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (versionToEdit) {
      setCode(versionToEdit.code);
      setName(versionToEdit.name);
      setDescription(versionToEdit.description || "");
      setEffectiveFrom(
        versionToEdit.effectiveFrom
          ? new Date(versionToEdit.effectiveFrom).toISOString().split("T")[0] || ""
          : ""
      );
      setEffectiveTo(
        versionToEdit.effectiveTo
          ? new Date(versionToEdit.effectiveTo).toISOString().split("T")[0] || ""
          : ""
      );
      setExternalId(versionToEdit.externalId || "");
    } else {
      setCode("");
      setName("");
      setDescription("");
      setEffectiveFrom("");
      setEffectiveTo("");
      setExternalId("");
    }
    setFormError(null);
  }, [versionToEdit, isOpen]);

  if (!isOpen || !curriculum || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isEditing && !code.trim()) {
      setFormError("Version code is required (e.g. v2, 2024-R1)");
      return;
    }

    if (!name.trim()) {
      setFormError("Version name is required");
      return;
    }

    if (effectiveFrom && effectiveTo) {
      if (new Date(effectiveTo) <= new Date(effectiveFrom)) {
        setFormError("Effective To date must be chronologically after Effective From");
        return;
      }
    }

    try {
      if (isEditing && versionToEdit) {
        const payload: UpdateCurriculumVersionPayload = {
          name: name.trim(),
          description: description.trim() || null,
          effectiveFrom: effectiveFrom || null,
          effectiveTo: effectiveTo || null,
          externalId: externalId.trim() || null,
        };
        await updateMutation.mutateAsync(payload);
      } else {
        const payload: CreateCurriculumVersionPayload = {
          code: code.trim(),
          name: name.trim(),
          description: description.trim() || null,
          effectiveFrom: effectiveFrom || null,
          effectiveTo: effectiveTo || null,
          externalId: externalId.trim() || null,
        };
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to save version"));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 min-w-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                {isEditing ? "Edit Version" : "New Curriculum Version"}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {curriculum.name} ({curriculum.code})
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 text-xs">
          {formError && <ErrorAlert message={formError} />}

          {!isEditing && (
            <div>
              <label
                htmlFor="v-code"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
              >
                Version Code <span className="text-destructive">*</span>
              </label>
              <input
                id="v-code"
                type="text"
                placeholder="e.g. v2, 2024-revised"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-10 sm:h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm font-mono shadow-2xs transition-all placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="v-name"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
            >
              Version Name <span className="text-destructive">*</span>
            </label>
            <input
              id="v-name"
              type="text"
              placeholder="e.g. 2024 National Standard Edition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 sm:h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm shadow-2xs transition-all placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="v-description"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
            >
              Description (Optional)
            </label>
            <textarea
              id="v-description"
              rows={2}
              placeholder="Summary of changes in this version..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 p-3 text-xs sm:text-sm shadow-2xs transition-all placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="v-effective-from"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
              >
                Effective From
              </label>
              <input
                id="v-effective-from"
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="h-10 sm:h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm shadow-2xs transition-all text-foreground focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="v-effective-to"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
              >
                Effective To
              </label>
              <input
                id="v-effective-to"
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                className="h-10 sm:h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm shadow-2xs transition-all text-foreground focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="v-ext-id"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
            >
              External Reference ID (Optional)
            </label>
            <input
              id="v-ext-id"
              type="text"
              placeholder="e.g. MOE-V2-EXT"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              className="h-10 sm:h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm font-mono shadow-2xs transition-all placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-3.5 sm:pt-4 border-t border-border mt-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 h-10 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isLoading}
              loadingText={isEditing ? "Saving..." : "Creating..."}
              className="w-full sm:w-auto h-10 px-5 text-xs sm:text-sm font-semibold"
            >
              {isEditing ? "Save Changes" : "Create Version"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
