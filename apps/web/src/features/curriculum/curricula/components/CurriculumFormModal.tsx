"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen } from "lucide-react";
import {
  CurriculumItem,
  CreateCurriculumPayload,
  UpdateCurriculumPayload,
  CurriculumScope,
} from "../types/curriculum.types";
import { useCreateCurriculum, useUpdateCurriculum } from "../hooks/useCurricula";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface CurriculumFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly itemToEdit: CurriculumItem | null;
}

export function CurriculumFormModal({
  isOpen,
  onClose,
  itemToEdit,
}: CurriculumFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<CurriculumScope>("TENANT");
  const [authorityName, setAuthorityName] = useState("");
  const [externalId, setExternalId] = useState("");
  const [initialVersionCode, setInitialVersionCode] = useState("v1");
  const [initialVersionName, setInitialVersionName] = useState("Version 1");
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateCurriculum();
  const updateMutation = useUpdateCurriculum(itemToEdit?.id ?? "");

  const isEditing = Boolean(itemToEdit);
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (itemToEdit) {
      setCode(itemToEdit.code);
      setName(itemToEdit.name);
      setDescription(itemToEdit.description || "");
      setScope(itemToEdit.scope);
      setAuthorityName(itemToEdit.authorityName || "");
      setExternalId(itemToEdit.externalId || "");
    } else {
      setCode("");
      setName("");
      setDescription("");
      setScope("TENANT");
      setAuthorityName("");
      setExternalId("");
      setInitialVersionCode("v1");
      setInitialVersionName("Version 1");
    }
    setFormError(null);
  }, [itemToEdit, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isEditing) {
      if (!code.trim()) {
        setFormError("Curriculum Code is required");
        return;
      }
      if (!/^[A-Za-z0-9_-]{2,50}$/.test(code.trim())) {
        setFormError(
          "Code must be 2-50 alphanumeric characters (hyphens and underscores allowed)"
        );
        return;
      }
    }

    if (!name.trim()) {
      setFormError("Curriculum Name is required");
      return;
    }

    try {
      if (isEditing && itemToEdit) {
        const payload: UpdateCurriculumPayload = {
          name: name.trim(),
          description: description.trim() || null,
          authorityName: authorityName.trim() || null,
          externalId: externalId.trim() || null,
        };
        await updateMutation.mutateAsync(payload);
      } else {
        const payload: CreateCurriculumPayload = {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || null,
          scope,
          authorityName: authorityName.trim() || null,
          externalId: externalId.trim() || null,
          initialVersionCode: initialVersionCode.trim() || "v1",
          initialVersionName: initialVersionName.trim() || "Version 1",
        };
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to save curriculum"));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 min-w-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                {isEditing ? "Edit Curriculum" : "New Curriculum"}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {isEditing
                  ? "Update curriculum metadata"
                  : "Define a curriculum framework & initial version"}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="curriculum-code"
                  className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
                >
                  Curriculum Code <span className="text-destructive">*</span>
                </label>
                <input
                  id="curriculum-code"
                  type="text"
                  placeholder="e.g. ETH-NAT-2024"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-10 sm:h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm font-mono uppercase shadow-2xs transition-all placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="curriculum-scope"
                  className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
                >
                  Scope <span className="text-destructive">*</span>
                </label>
                <select
                  id="curriculum-scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value as CurriculumScope)}
                  className="h-10 sm:h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm shadow-2xs transition-all text-foreground focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="TENANT">School Custom</option>
                  <option value="SYSTEM">National System</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="curriculum-name"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
            >
              Curriculum Name <span className="text-destructive">*</span>
            </label>
            <input
              id="curriculum-name"
              type="text"
              placeholder="e.g. Ethiopian National Secondary Curriculum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 sm:h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm shadow-2xs transition-all placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="curriculum-description"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
            >
              Description
            </label>
            <textarea
              id="curriculum-description"
              rows={2}
              placeholder="Brief description of the curriculum standards and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 p-3 text-xs sm:text-sm shadow-2xs transition-all placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="curriculum-authority"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
              >
                Authority / Source
              </label>
              <input
                id="curriculum-authority"
                type="text"
                placeholder="e.g. Ministry of Education"
                value={authorityName}
                onChange={(e) => setAuthorityName(e.target.value)}
                className="h-10 sm:h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm shadow-2xs transition-all placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="curriculum-external-id"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 select-none"
              >
                External ID (Optional)
              </label>
              <input
                id="curriculum-external-id"
                type="text"
                placeholder="e.g. MOE-CURR-01"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                className="h-10 sm:h-11 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm font-mono shadow-2xs transition-all placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-hidden"
                disabled={isLoading}
              />
            </div>
          </div>

          {!isEditing && (
            <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-2.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Initial Version Defaults
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="initial-v-code"
                    className="block text-[11px] font-medium text-foreground/80 mb-1"
                  >
                    Version Code
                  </label>
                  <input
                    id="initial-v-code"
                    type="text"
                    value={initialVersionCode}
                    onChange={(e) => setInitialVersionCode(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-mono outline-hidden"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="initial-v-name"
                    className="block text-[11px] font-medium text-foreground/80 mb-1"
                  >
                    Version Name
                  </label>
                  <input
                    id="initial-v-name"
                    type="text"
                    value={initialVersionName}
                    onChange={(e) => setInitialVersionName(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-hidden"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

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
              {isEditing ? "Save Changes" : "Create Curriculum"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
