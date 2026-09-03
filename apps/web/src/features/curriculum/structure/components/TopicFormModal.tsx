"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FolderGit2, X } from "lucide-react";
import { CurriculumTopicItem } from "../types/structure.types";
import { useCreateTopic, useUpdateTopic } from "../hooks/useStructure";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface TopicFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly unitId: string;
  readonly itemToEdit?: CurriculumTopicItem | null;
}

export function TopicFormModal({
  isOpen,
  onClose,
  unitId,
  itemToEdit,
}: TopicFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [externalId, setExternalId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = Boolean(itemToEdit);
  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();

  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setCode(itemToEdit.code);
      setDescription(itemToEdit.description || "");
      setExternalId(itemToEdit.externalId || "");
    } else {
      setTitle("");
      setCode("");
      setDescription("");
      setExternalId("");
    }
    setFormError(null);
  }, [isOpen, itemToEdit]);

  if (!mounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Topic title is required");
      return;
    }

    try {
      if (isEditing && itemToEdit) {
        await updateMutation.mutateAsync({
          topicId: itemToEdit.id,
          unitId: itemToEdit.unitId,
          payload: {
            title: title.trim(),
            description: description.trim() || null,
            externalId: externalId.trim() || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          unitId,
          title: title.trim(),
          code: code.trim() || undefined,
          description: description.trim() || undefined,
          externalId: externalId.trim() || undefined,
        });
      }
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to save topic"));
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={isPending ? undefined : onClose}
      />
      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderGit2 size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {isEditing ? "Edit Topic" : "Create New Topic"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {isEditing
                  ? "Update topic details"
                  : "Add a topic under this unit"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {formError && <ErrorAlert message={formError} />}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Topic Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Quadratic Equations and Formulas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              className="w-full h-9 px-3 rounded-lg text-xs bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
            />
          </div>

          {!isEditing && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Topic Code
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Auto-generated if empty
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g. T-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isPending}
                className="w-full h-9 px-3 rounded-lg text-xs bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Topic learning overview and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              className="w-full p-3 rounded-lg text-xs bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              External Reference ID <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. MOE-TOPIC-01"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              disabled={isPending}
              className="w-full h-9 px-3 rounded-lg text-xs bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-9 px-4 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <SubmitButton
              type="submit"
              isLoading={isPending}
              loadingText={isEditing ? "Updating..." : "Creating..."}
              className="h-9 px-4 text-xs font-semibold"
            >
              {isEditing ? "Update Topic" : "Create Topic"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
