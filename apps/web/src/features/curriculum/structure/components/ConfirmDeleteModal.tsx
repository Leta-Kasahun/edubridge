"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { SubmitButton } from "@/shared/components";

interface ConfirmDeleteModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => Promise<void> | void;
  readonly title: string;
  readonly description: string;
  readonly itemName?: string;
  readonly isPending?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isPending = false,
}: ConfirmDeleteModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

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
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
              {itemName && (
                <div className="mt-2 p-2 rounded-lg bg-muted text-xs font-semibold text-foreground truncate">
                  {itemName}
                </div>
              )}
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
              onClick={onConfirm}
              isLoading={isPending}
              loadingText="Deleting..."
              className="h-9 px-4 text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Delete
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
