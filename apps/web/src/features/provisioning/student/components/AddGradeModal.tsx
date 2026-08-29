"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";

export interface AddGradeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (level: number) => Promise<void>;
  readonly isSubmitting: boolean;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { message?: string; error?: { message?: string } } } }).response;
    if (res?.data?.message) return res.data.message;
    if (res?.data?.error?.message) return res.data.error.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function AddGradeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddGradeModalProps) {
  const [level, setLevel] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericLevel = Number(level);
    if (!numericLevel || numericLevel < 1 || numericLevel > 20) {
      setError("Please enter a valid grade level between 1 and 20.");
      return;
    }

    try {
      await onSubmit(numericLevel);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Grade level could not be added. Please verify the input."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <h2 className="text-sm font-bold text-foreground">Add Grade Level</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <ErrorAlert message={error} />}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Grade Level Number *
            </label>
            <input
              type="number"
              min={1}
              max={20}
              placeholder="e.g. 7, 8, 9, 10, 11, 12"
              value={level}
              onChange={(e) => setLevel(e.target.value ? Number(e.target.value) : "")}
              className="w-full h-9.5 px-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-border"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isSubmitting}
              loadingText="Adding..."
              disabled={level === ""}
              className="w-auto h-9 px-4 text-xs font-semibold"
            >
              Add grade
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
