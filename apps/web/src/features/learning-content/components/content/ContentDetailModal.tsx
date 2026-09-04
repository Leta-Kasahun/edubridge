"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  BookOpen,
  GitBranch,
  Paperclip,
  UploadCloud,
  Trash2,
  Download,
  ExternalLink,
  Send,
  Check,
  Archive,
  Plus,
} from "lucide-react";
import {
  LearningContentListItem,
  LearningContentDetailItem,
} from "../../types/content.types";
import {
  useContentDetail,
  useUploadAttachment,
  useDeleteAttachment,
  useSubmitContent,
  usePublishContent,
  useArchiveContent,
} from "../../hooks/useLearningContent";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { ContentStatusBadge } from "./ContentStatusBadge";
import { ContentScopeBadge } from "./ContentScopeBadge";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { LoadingSpinner, ErrorAlert } from "@/shared/components";
import { getErrorMessage, formatFileSize } from "@/shared/utils";

interface ContentDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly item: LearningContentListItem | LearningContentDetailItem | null;
  readonly onOpenNewVersionModal: (item: LearningContentDetailItem) => void;
}

type TabType = "overview" | "versions" | "attachments" | "mappings";

export function ContentDetailModal({
  isOpen,
  onClose,
  item,
  onOpenNewVersionModal,
}: ContentDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteAttachmentTarget, setDeleteAttachmentTarget] = useState<{
    readonly id: string;
    readonly fileName: string;
  } | null>(null);

  const { data: detail, isLoading, error } = useContentDetail(
    isOpen && item ? item.id : null
  );

  const uploadAttachmentMutation = useUploadAttachment(item?.id || "");
  const deleteAttachmentMutation = useDeleteAttachment(item?.id || "");
  const submitMutation = useSubmitContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !item || !mounted) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionError(null);
    setIsUploading(true);

    try {
      await uploadAttachmentMutation.mutateAsync(file);
      e.target.value = "";
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDeleteAttachment = async () => {
    if (!deleteAttachmentTarget) return;
    setActionError(null);
    try {
      await deleteAttachmentMutation.mutateAsync(deleteAttachmentTarget.id);
      setDeleteAttachmentTarget(null);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleSubmitForReview = async () => {
    setActionError(null);
    try {
      await submitMutation.mutateAsync(item.id);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handlePublish = async () => {
    setActionError(null);
    try {
      await publishMutation.mutateAsync(item.id);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleArchive = async () => {
    setActionError(null);
    try {
      await archiveMutation.mutateAsync(item.id);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const displayItem = detail || item;
  const attachmentCount = detail
    ? detail.attachments.length
    : "attachmentCount" in item
    ? item.attachmentCount
    : 0;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-3xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 min-w-0 flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <ContentTypeBadge type={displayItem.type} />
                <ContentScopeBadge scope={displayItem.scope} />
                <ContentStatusBadge status={displayItem.status} />
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                  v{displayItem.currentVersion}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                {displayItem.title}
              </h2>
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

        <div className="flex items-center gap-2 px-4 sm:px-6 border-b border-border bg-card overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview & Body
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("versions")}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "versions"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Versions Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attachments")}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "attachments"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Attachments ({attachmentCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mappings")}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "mappings"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Curriculum Mappings
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {actionError && <ErrorAlert message={actionError} />}
          {error && <ErrorAlert message={getErrorMessage(error)} />}

          {isLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {displayItem.description && (
                    <div className="bg-muted/20 border border-border rounded-xl p-3.5 space-y-1">
                      <span className="text-[11px] text-muted-foreground block font-medium">
                        Description
                      </span>
                      <p className="text-xs text-foreground leading-relaxed">
                        {displayItem.description}
                      </p>
                    </div>
                  )}

                  {detail?.currentVersionDetail?.body.resourceUrl && (
                    <div className="bg-muted/20 border border-border rounded-xl p-3.5 space-y-1">
                      <span className="text-[11px] text-muted-foreground block font-medium">
                        Resource Link
                      </span>
                      <a
                        href={detail.currentVersionDetail.body.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        {detail.currentVersionDetail.body.resourceUrl}
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  )}

                  <div className="bg-muted/20 border border-border rounded-xl p-3.5 space-y-2">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Current Content Body (v{displayItem.currentVersion})
                    </span>
                    <div className="p-3 rounded-lg bg-card border border-border text-xs text-foreground whitespace-pre-wrap font-sans">
                      {detail?.currentVersionDetail?.body.text ||
                        "No text body configured for this version."}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-muted/20 border border-border">
                      <span className="text-[11px] text-muted-foreground block font-medium">
                        Created
                      </span>
                      <span className="font-semibold text-foreground">
                        {new Date(displayItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/20 border border-border">
                      <span className="text-[11px] text-muted-foreground block font-medium">
                        Author
                      </span>
                      <span className="font-semibold text-foreground">
                        {displayItem.authorName || "Teacher"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/20 border border-border">
                      <span className="text-[11px] text-muted-foreground block font-medium">
                        Published At
                      </span>
                      <span className="font-semibold text-foreground">
                        {displayItem.publishedAt
                          ? new Date(displayItem.publishedAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : displayItem.status === "DRAFT"
                          ? "Draft (Not Published)"
                          : "Not Published"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "versions" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground">
                      Revisions Timeline
                    </h3>
                    {detail && (
                      <button
                        type="button"
                        onClick={() => onOpenNewVersionModal(detail)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Plus size={13} />
                        <span>Save Version</span>
                      </button>
                    )}
                  </div>

                  {detail?.currentVersionDetail ? (
                    <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-primary text-primary-foreground">
                            v{detail.currentVersionDetail.version} Current
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              detail.currentVersionDetail.createdAt
                            ).toLocaleString()}
                          </span>
                        </div>
                        {detail.currentVersionDetail.creatorName && (
                          <span className="text-xs text-muted-foreground">
                            {detail.currentVersionDetail.creatorName}
                          </span>
                        )}
                      </div>
                      {detail.currentVersionDetail.changeNote && (
                        <p className="text-xs text-foreground font-medium">
                          Note: {detail.currentVersionDetail.changeNote}
                        </p>
                      )}
                      {detail.currentVersionDetail.snapshottedAttachments &&
                        detail.currentVersionDetail.snapshottedAttachments.length >
                          0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {detail.currentVersionDetail.snapshottedAttachments.map(
                              (att) => (
                                <span
                                  key={att.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-card border border-border text-foreground"
                                >
                                  <Paperclip size={11} className="text-muted-foreground" />
                                  <span>{att.fileName}</span>
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No version timeline records found.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center text-center space-y-2">
                    <UploadCloud size={24} className="text-primary" />
                    <div>
                      <label className="cursor-pointer text-xs font-semibold text-primary hover:underline">
                        <span>Click to upload attachment</span>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Documents, PDFs, Images, Audio, Video up to 100MB
                      </p>
                    </div>
                    {isUploading && (
                      <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                        <LoadingSpinner /> Uploading to cloud storage...
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {detail?.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-card border border-border text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Paperclip size={15} className="text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {att.fileName}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              {formatFileSize(parseInt(att.sizeBytes || "0", 10))} &bull; {att.mimeType}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={att.deliveryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Download/Open"
                          >
                            <Download size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteAttachmentTarget({
                                id: att.id,
                                fileName: att.fileName,
                              })
                            }
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {detail?.attachments.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-4 italic">
                        No files attached yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "mappings" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Scope</span>
                      <ContentScopeBadge scope={displayItem.scope} />
                    </div>
                    {displayItem.subjectName && (
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>Subject:</span>
                        <strong className="text-foreground">{displayItem.subjectName}</strong>
                      </div>
                    )}
                    {displayItem.targetGradeLevels &&
                      displayItem.targetGradeLevels.length > 0 && (
                        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                          <span>Target Grades:</span>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {displayItem.targetGradeLevels.map((lvl) => (
                              <span
                                key={lvl}
                                className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px] border border-primary/20"
                              >
                                Grade {lvl}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    {displayItem.gradeLevel &&
                      (!displayItem.targetGradeLevels ||
                        displayItem.targetGradeLevels.length <= 1) && (
                        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                          <span>Grade:</span>
                          <strong className="text-foreground">
                            Grade {displayItem.gradeLevel}
                          </strong>
                        </div>
                      )}
                    {displayItem.unitTitle && (
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>Unit:</span>
                        <strong className="text-foreground">{displayItem.unitTitle}</strong>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-foreground">
                      Topics
                    </h3>
                    {detail?.topics.map((t) => (
                      <div
                        key={t.topicId}
                        className="p-3 rounded-xl bg-muted/20 border border-border text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {t.topicCode}: {t.topicTitle}
                          </span>
                          {t.isPrimary && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                              Primary Topic
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {t.subjectName} &bull; Unit: {t.unitTitle} ({t.unitCode})
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-foreground">
                      Mapped Learning Objectives
                    </h3>
                    {detail?.objectives.map((obj) => (
                      <div
                        key={obj.objectiveId}
                        className="p-3 rounded-xl bg-muted/20 border border-border text-xs space-y-1"
                      >
                        <span className="font-bold text-primary block">
                          {obj.objectiveCode}
                        </span>
                        <p className="text-foreground">
                          {obj.objectiveStatement}
                        </p>
                        {obj.objectiveDescription && (
                          <p className="text-[11px] text-muted-foreground italic">
                            {obj.objectiveDescription}
                          </p>
                        )}
                      </div>
                    ))}
                    {detail?.objectives.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        No specific learning objectives mapped.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            {displayItem.status === "DRAFT" && (
              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={submitMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <Send size={13} />
                <span>Submit</span>
              </button>
            )}

            {displayItem.status !== "PUBLISHED" && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
              >
                <Check size={13} />
                <span>Activate</span>
              </button>
            )}

            {displayItem.status === "PUBLISHED" && (
              <button
                type="button"
                onClick={handleArchive}
                disabled={archiveMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-border"
              >
                <Archive size={13} />
                <span>Archive</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={Boolean(deleteAttachmentTarget)}
        onClose={() => setDeleteAttachmentTarget(null)}
        onConfirm={handleConfirmDeleteAttachment}
        title="Delete Attachment"
        description="Are you sure you want to delete this attachment? The file will be permanently deleted from cloud storage."
        itemName={deleteAttachmentTarget?.fileName}
        isPending={deleteAttachmentMutation.isPending}
      />
    </div>,
    document.body
  );
}
