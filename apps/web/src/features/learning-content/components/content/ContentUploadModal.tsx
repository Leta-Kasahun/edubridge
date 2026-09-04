"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, UploadCloud, File, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  LearningContentListItem,
  LearningContentDetailItem,
} from "../../types/content.types";
import { useUploadAttachment } from "../../hooks/useLearningContent";
import { formatFileSize, getErrorMessage } from "@/shared/utils";
import { SubmitButton, ErrorAlert } from "@/shared/components";

interface ContentUploadModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly item: LearningContentListItem | LearningContentDetailItem | null;
}

interface QueuedFile {
  readonly id: string;
  readonly file: File;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

export function ContentUploadModal({
  isOpen,
  onClose,
  item,
}: ContentUploadModalProps) {
  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadAttachment(item?.id || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQueue([]);
      setGlobalError(null);
    }
  }, [isOpen]);

  if (!mounted || !isOpen || !item) return null;

  const handleAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGlobalError(null);

    const newItems: QueuedFile[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      status: "pending",
    }));

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleAddFiles(e.dataTransfer.files);
  };

  const handleUploadAll = async () => {
    const pendingFiles = queue.filter((q) => q.status === "pending" || q.status === "error");
    if (pendingFiles.length === 0) return;

    setGlobalError(null);

    for (const itemFile of pendingFiles) {
      setQueue((prev) =>
        prev.map((q) => (q.id === itemFile.id ? { ...q, status: "uploading" } : q))
      );

      try {
        await uploadMutation.mutateAsync(itemFile.file);
        setQueue((prev) =>
          prev.map((q) => (q.id === itemFile.id ? { ...q, status: "success" } : q))
        );
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Upload failed");
        setQueue((prev) =>
          prev.map((q) =>
            q.id === itemFile.id
              ? { ...q, status: "error", errorMessage: message }
              : q
          )
        );
      }
    }
  };

  const isUploading = queue.some((q) => q.status === "uploading");
  const pendingCount = queue.filter((q) => q.status === "pending" || q.status === "error").length;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden my-auto animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UploadCloud size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                Upload Attachments
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {item.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {globalError && <ErrorAlert message={globalError} />}

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer text-center ${
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
                handleAddFiles(e.target.files);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="hidden"
            />
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <UploadCloud size={20} />
            </div>
            <p className="text-xs font-semibold text-foreground">
              Click to select files or drag and drop
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              PDF, Documents, Videos, Images up to 100MB
            </p>
          </div>

          {queue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>Selected Files ({queue.length})</span>
                <span className="text-[11px] text-muted-foreground">
                  {queue.filter((q) => q.status === "success").length} uploaded
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {queue.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <File size={14} className="text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate text-xs">
                          {q.file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatFileSize(q.file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {q.status === "uploading" && (
                        <span className="text-[11px] text-primary font-medium">
                          Uploading...
                        </span>
                      )}
                      {q.status === "success" && (
                        <CheckCircle2 size={15} className="text-emerald-500" />
                      )}
                      {q.status === "error" && (
                        <span
                          title={q.errorMessage}
                          className="text-[11px] text-destructive flex items-center gap-1"
                        >
                          <AlertCircle size={13} />
                          Failed
                        </span>
                      )}
                      {q.status !== "uploading" && q.status !== "success" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(q.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              {queue.some((q) => q.status === "success") ? "Close" : "Cancel"}
            </button>
            <SubmitButton
              onClick={handleUploadAll}
              disabled={pendingCount === 0 || isUploading}
              isLoading={isUploading}
              loadingText="Uploading..."
              size="sm"
            >
              Upload {pendingCount > 0 ? `(${pendingCount})` : ""}
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
