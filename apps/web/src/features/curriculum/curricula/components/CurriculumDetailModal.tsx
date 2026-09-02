"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Layers, PlusCircle, Calendar, CheckCircle2, Archive, FileEdit, BookOpen } from "lucide-react";
import {
  CurriculumItem,
  CurriculumVersionItem,
  CurriculumVersionStatus,
} from "../types/curriculum.types";
import {
  useCurriculumDetails,
  useChangeVersionStatus,
} from "../hooks/useCurricula";
import { LoadingSpinner } from "@/shared/components";

interface CurriculumDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly curriculumItem: CurriculumItem | null;
  readonly onAddVersion: (curriculum: CurriculumItem) => void;
  readonly onEditVersion: (
    curriculum: CurriculumItem,
    version: CurriculumVersionItem
  ) => void;
}

function VersionStatusBadge({ status }: { readonly status: CurriculumVersionStatus }) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Active Version</span>
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span>Draft</span>
        </span>
      );
    case "ARCHIVED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
          <span>Archived</span>
        </span>
      );
  }
}

export function CurriculumDetailModal({
  isOpen,
  onClose,
  curriculumItem,
  onAddVersion,
  onEditVersion,
}: CurriculumDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const curriculumId = curriculumItem?.id ?? null;
  const { data: detailData, isLoading } = useCurriculumDetails(curriculumId);
  const changeVersionStatusMutation = useChangeVersionStatus(
    curriculumId ?? "",
    ""
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !curriculumItem || !mounted) return null;

  const isSystemScope =
    curriculumItem.scope === "SYSTEM" && curriculumItem.tenantId === null;

  const handleStatusChange = async (
    versionId: string,
    status: CurriculumVersionStatus
  ) => {
    if (!curriculumId) return;
    await changeVersionStatusMutation.mutateAsync(status);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 min-w-0 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                  {curriculumItem.code}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  {curriculumItem.scope === "SYSTEM" ? "National Standard" : "School Custom"}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                {curriculumItem.name}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Metadata Card */}
          <div className="bg-muted/20 border border-border rounded-xl p-3.5 space-y-2.5">
            {curriculumItem.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {curriculumItem.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-border/60">
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">
                  Authority / Source
                </span>
                <span className="font-semibold text-foreground">
                  {curriculumItem.authorityName || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">
                  External Reference
                </span>
                <span className="font-mono text-foreground">
                  {curriculumItem.externalId || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">
                  Last Updated
                </span>
                <span className="text-foreground">
                  {new Date(curriculumItem.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Versions Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-primary" />
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  Curriculum Versions ({detailData?.versions.length ?? curriculumItem.versionCount})
                </h3>
              </div>

              {!isSystemScope && (
                <button
                  type="button"
                  onClick={() => onAddVersion(curriculumItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
                >
                  <PlusCircle size={13} />
                  <span>New Version</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="p-8 flex items-center justify-center text-muted-foreground">
                <LoadingSpinner size={20} />
              </div>
            ) : detailData?.versions && detailData.versions.length > 0 ? (
              <div className="space-y-2.5">
                {detailData.versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3.5 bg-card border border-border rounded-xl shadow-2xs hover:border-border/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                          {ver.code}
                        </span>
                        <span className="font-bold text-foreground text-xs">
                          {ver.name}
                        </span>
                        <VersionStatusBadge status={ver.status} />
                      </div>

                      {ver.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {ver.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          <span>{ver.subjectCount} Subjects</span>
                        </span>
                        {(ver.effectiveFrom || ver.effectiveTo) && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>
                              {ver.effectiveFrom
                                ? new Date(ver.effectiveFrom).toLocaleDateString()
                                : "Start"}{" "}
                              —{" "}
                              {ver.effectiveTo
                                ? new Date(ver.effectiveTo).toLocaleDateString()
                                : "Indefinite"}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {!isSystemScope && (
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => onEditVersion(curriculumItem, ver)}
                          disabled={ver.status === "ARCHIVED"}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-40"
                          title="Edit Version"
                        >
                          <FileEdit size={14} />
                        </button>

                        {ver.status !== "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(ver.id, "ACTIVE")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={12} />
                            <span>Activate</span>
                          </button>
                        )}

                        {ver.status !== "ARCHIVED" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(ver.id, "ARCHIVED")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Archive size={12} />
                            <span>Archive</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                No versions recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-border flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 h-10 text-xs sm:text-sm font-semibold bg-muted text-foreground hover:bg-muted/80 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
