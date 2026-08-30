"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  GraduationCap,
  Briefcase,
  FileText,
  FileX,
  ArrowUpRight,
} from "lucide-react";
import { DocumentPreviewModal } from "@/shared/components/document/DocumentPreviewModal";
import { isPdfDocument, isImageDocument } from "@/shared/utils/document.util";
import {
  formatExperienceDateRange,
  calculateExperienceDuration,
  calculateTotalExperience,
} from "@/shared/utils/experience.util";
import {
  StaffDirectoryItem,
  StaffQualificationItem,
  QUALIFICATION_LEVEL_LABELS,
} from "../types/staff-qualifications.types";

export interface StaffQualificationsDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly teacher: StaffDirectoryItem | null;
}

export function StaffQualificationsDetailModal({
  isOpen,
  onClose,
  teacher,
}: StaffQualificationsDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>("Certificate");
  const [previewDocSubtitle, setPreviewDocSubtitle] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !teacher) return null;

  const totalExperienceText = calculateTotalExperience(teacher.experiences);

  const handlePreviewCertificate = (qual: StaffQualificationItem) => {
    if (!qual.documentUrl) return;
    const title = `${QUALIFICATION_LEVEL_LABELS[qual.level] || qual.level} — ${
      qual.fieldOfStudy
    }`;
    const subtitle = `${qual.institution || "Institution"} · ${
      qual.graduationYear
        ? `Graduated ${qual.graduationYear}`
        : qual.startYear
        ? `Started ${qual.startYear}`
        : "Academic Credential"
    }`;
    setPreviewDocTitle(title);
    setPreviewDocSubtitle(subtitle);
    setPreviewDocUrl(qual.documentUrl);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl sm:max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              {teacher.fullName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Teacher Qualifications Dossier
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Full Name
              </span>
              <span className="text-sm font-medium text-foreground mt-1 block truncate">
                {teacher.fullName}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Teaching Experience
              </span>
              <span className="text-sm font-medium text-foreground mt-1 block">
                {totalExperienceText} ({teacher.experiences.length}{" "}
                {teacher.experiences.length === 1 ? "role" : "roles"})
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Status
              </span>
              <span className="text-sm font-medium text-foreground mt-1 block">
                {teacher.status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap size={15} className="text-muted-foreground" />
              <span>Education / qualifications ({teacher.qualifications.length})</span>
            </span>

            {teacher.qualifications.length === 0 ? (
              <div className="p-3.5 rounded-xl border border-border bg-background/50 text-center">
                <p className="text-xs text-muted-foreground">
                  No academic qualifications on record.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {teacher.qualifications.map((qual) => {
                  const hasDoc = Boolean(qual.documentUrl);
                  const isPdf = isPdfDocument(qual.documentUrl);
                  const isImage = isImageDocument(qual.documentUrl);
                  const levelLabel =
                    QUALIFICATION_LEVEL_LABELS[qual.level] || qual.level;

                  return (
                    <div
                      key={qual.id}
                      className="p-3.5 rounded-xl border border-border bg-background/50 flex items-center justify-between gap-3 hover:border-foreground/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          onClick={() => {
                            if (hasDoc) handlePreviewCertificate(qual);
                          }}
                          className={`relative w-14 h-12 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border transition-all group/thumb ${
                            hasDoc
                              ? "bg-card border-border cursor-pointer hover:border-foreground/40 hover:shadow-xs"
                              : "bg-muted/30 text-muted-foreground/40 border-border/40"
                          }`}
                          title={
                            hasDoc
                              ? "Click to preview certificate"
                              : "No certificate attached"
                          }
                        >
                          {hasDoc ? (
                            <>
                              {isImage && qual.documentUrl ? (
                                <Image
                                  src={qual.documentUrl}
                                  alt="Certificate preview"
                                  fill
                                  unoptimized
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : isPdf && qual.documentUrl ? (
                                <div className="relative w-full h-full overflow-hidden bg-muted/20">
                                  <iframe
                                    src={`${qual.documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                    title="PDF preview thumbnail"
                                    className="w-[300%] h-[300%] origin-top-left scale-[0.33] pointer-events-none border-0 select-none"
                                  />
                                  <div className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded-sm bg-card/90 border border-border text-[8px] font-bold text-foreground">
                                    PDF
                                  </div>
                                </div>
                              ) : (
                                <FileText size={18} className="text-muted-foreground" />
                              )}

                              <div className="absolute top-1 right-1 p-0.5 rounded-sm bg-card/90 text-foreground border border-border opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-xs pointer-events-none">
                                <ArrowUpRight size={12} />
                              </div>
                            </>
                          ) : (
                            <FileX size={18} className="opacity-40" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {levelLabel} — {qual.fieldOfStudy}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {qual.institution || "Institution"}
                            {(qual.startYear || qual.graduationYear) && (
                              <span>
                                {" · "}
                                {qual.startYear && qual.graduationYear
                                  ? `${qual.startYear} → ${qual.graduationYear}`
                                  : qual.graduationYear
                                  ? `${qual.graduationYear}`
                                  : `${qual.startYear}`}
                              </span>
                            )}
                            {!hasDoc && (
                              <span className="text-muted-foreground/70">
                                {" · "}No certificate uploaded
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={15} className="text-muted-foreground" />
              <span>Work experience ({teacher.experiences.length})</span>
            </span>

            {teacher.experiences.length === 0 ? (
              <div className="p-3.5 rounded-xl border border-border bg-background/50 text-center">
                <p className="text-xs text-muted-foreground">
                  No work experience records on file.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
                  {teacher.experiences.map((exp) => {
                    const isCurrent = !exp.endDate;
                    const dateRange = formatExperienceDateRange(
                      exp.startDate,
                      exp.endDate
                    );
                    const duration = calculateExperienceDuration(
                      exp.startDate,
                      exp.endDate
                    );

                    return (
                      <div key={exp.id} className="relative">
                        <div
                          className={`absolute -left-5 top-1.5 w-2 h-2 rounded-full ${
                            isCurrent
                              ? "bg-blue-500 ring-4 ring-blue-500/20"
                              : "bg-muted-foreground/50"
                          }`}
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-foreground">
                            {exp.position || "Teacher"} — {exp.institution}
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {dateRange}
                            {duration && <span> · {duration}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end px-5 sm:px-6 py-3.5 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <DocumentPreviewModal
        isOpen={Boolean(previewDocUrl)}
        onClose={() => setPreviewDocUrl(null)}
        documentUrl={previewDocUrl}
        title={previewDocTitle}
        subtitle={previewDocSubtitle}
      />
    </div>,
    document.body
  );
}
