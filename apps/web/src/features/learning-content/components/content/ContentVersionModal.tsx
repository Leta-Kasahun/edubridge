"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, GitBranch, Paperclip } from "lucide-react";
import {
  LearningContentListItem,
  LearningContentDetailItem,
  CreateContentVersionDto,
} from "../../types/content.types";
import {
  useSaveNewVersion,
  useContentDetail,
} from "../../hooks/useLearningContent";
import { ErrorAlert, SubmitButton } from "@/shared/components";
import { getErrorMessage, formatFileSize } from "@/shared/utils";

interface ContentVersionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly item: LearningContentListItem | LearningContentDetailItem | null;
}

export function ContentVersionModal({
  isOpen,
  onClose,
  item,
}: ContentVersionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: detail } = useContentDetail(isOpen && item ? item.id : null);
  const saveVersionMutation = useSaveNewVersion(item?.id || "");

  const nextVersionNumber = (item?.currentVersion ?? 0) + 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && detail) {
      setFormError(null);
      const currentBody = detail.currentVersionDetail?.body;
      setText(currentBody?.text || "");
      setResourceUrl(currentBody?.resourceUrl || "");
      setChangeNote(`Revision update to Version ${nextVersionNumber}`);
      setSelectedAttachmentIds(
        (currentBody?.attachmentIds as string[]) ||
          detail.attachments.map((a) => a.id) ||
          []
      );
    }
  }, [isOpen, detail, nextVersionNumber]);

  if (!isOpen || !item || !mounted) return null;

  const toggleAttachment = (id: string) => {
    setSelectedAttachmentIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!changeNote.trim()) {
      setFormError("A brief note describing what changed is required");
      return;
    }

    try {
      const payload: CreateContentVersionDto = {
        body: {
          text: text.trim(),
          resourceUrl: resourceUrl.trim() || null,
          attachmentIds: selectedAttachmentIds,
        },
        changeNote: changeNote.trim(),
      };

      await saveVersionMutation.mutateAsync(payload);
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 min-w-0 flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <GitBranch size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Save New Version
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  v{nextVersionNumber}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {item.title}
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
              Change Note <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="e.g. Added practice problem explanations and diagrams"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Content Body Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Updated lesson notes, problem text, or instructional guide..."
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
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
              placeholder="https://example.com/updated-resource"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {detail && detail.attachments.length > 0 && (
            <div className="space-y-2 p-3 rounded-xl bg-muted/20 border border-border">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Paperclip size={13} className="text-muted-foreground" />
                <span>Snapshot Attachments in this Version</span>
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {detail.attachments.map((att) => {
                  const isChecked = selectedAttachmentIds.includes(att.id);
                  return (
                    <label
                      key={att.id}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-primary/10 border-primary/30 text-foreground"
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAttachment(att.id)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="truncate font-medium text-foreground">
                          {att.fileName}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatFileSize(parseInt(att.sizeBytes || "0", 10))}
                      </span>
                    </label>
                  );
                })}
              </div>
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
              isLoading={saveVersionMutation.isPending}
              loadingText="Saving Version..."
              size="sm"
            >
              Save Version {nextVersionNumber}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
