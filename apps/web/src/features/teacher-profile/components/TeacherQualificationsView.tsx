"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  FileX,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import {
  LoadingSpinner,
  ErrorAlert,
  DocumentPreviewModal,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { isPdfDocument, isImageDocument } from "@/shared/utils/document.util";
import {
  formatExperienceDateRange,
  calculateExperienceDuration,
} from "@/shared/utils/experience.util";
import {
  useMyTeacherQualifications,
  useDeleteTeacherQualification,
} from "../hooks/useTeacherQualifications";
import {
  useMyTeacherExperiences,
  useDeleteTeacherExperience,
} from "../hooks/useTeacherExperience";
import {
  TeacherQualification,
  QUALIFICATION_LEVEL_LABELS,
} from "../types/teacher-qualification.types";
import { TeacherExperience } from "../types/teacher-experience.types";
import { QualificationFormModal } from "./QualificationFormModal";
import { ExperienceFormModal } from "./ExperienceFormModal";

function QualificationMenu({
  qualification,
  onEdit,
  onDelete,
  onPreview,
  isDeleting,
}: {
  readonly qualification: TeacherQualification;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly onPreview?: () => void;
  readonly isDeleting: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isDeleting}
        className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Options"
      >
        {isDeleting ? <LoadingSpinner size={14} /> : <MoreVertical size={16} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-none bg-card border border-border shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
          {qualification.documentUrl && onPreview && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onPreview();
              }}
              className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted/60 flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink size={13} className="text-muted-foreground" />
              <span>View Certificate</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted/60 flex items-center gap-2 cursor-pointer"
          >
            <Edit2 size={13} className="text-muted-foreground" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="w-full px-3 py-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ExperienceMenu({
  onEdit,
  onDelete,
  isDeleting,
}: {
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly isDeleting: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isDeleting}
        className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Options"
      >
        {isDeleting ? <LoadingSpinner size={14} /> : <MoreVertical size={16} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-none bg-card border border-border shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted/60 flex items-center gap-2 cursor-pointer"
          >
            <Edit2 size={13} className="text-muted-foreground" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="w-full px-3 py-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function TeacherQualificationsView() {
  const {
    data: qualificationsData,
    isLoading: isQualsLoading,
    error: qualsError,
  } = useMyTeacherQualifications();

  const {
    data: experiencesData,
    isLoading: isExpLoading,
    error: expError,
  } = useMyTeacherExperiences();

  const deleteQualMutation = useDeleteTeacherQualification();
  const deleteExpMutation = useDeleteTeacherExperience();

  const [isQualModalOpen, setIsQualModalOpen] = useState(false);
  const [selectedQualification, setSelectedQualification] =
    useState<TeacherQualification | null>(null);
  const [deletingQualId, setDeletingQualId] = useState<string | null>(null);

  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<TeacherExperience | null>(null);
  const [deletingExpId, setDeletingExpId] = useState<string | null>(null);

  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>("Certificate");
  const [previewDocSubtitle, setPreviewDocSubtitle] = useState<string>("");

  const qualifications = Array.isArray(qualificationsData)
    ? qualificationsData
    : [];
  const experiences = Array.isArray(experiencesData) ? experiencesData : [];

  const handleOpenAddQual = () => {
    setSelectedQualification(null);
    setIsQualModalOpen(true);
  };

  const handleOpenEditQual = (qual: TeacherQualification) => {
    setSelectedQualification(qual);
    setIsQualModalOpen(true);
  };

  const handleDeleteQual = async (id: string) => {
    setDeletingQualId(id);
    try {
      await deleteQualMutation.mutateAsync(id);
    } finally {
      setDeletingQualId(null);
    }
  };

  const handleOpenAddExp = () => {
    setSelectedExperience(null);
    setIsExpModalOpen(true);
  };

  const handleOpenEditExp = (exp: TeacherExperience) => {
    setSelectedExperience(exp);
    setIsExpModalOpen(true);
  };

  const handleDeleteExp = async (id: string) => {
    setDeletingExpId(id);
    try {
      await deleteExpMutation.mutateAsync(id);
    } finally {
      setDeletingExpId(null);
    }
  };

  const handlePreviewCertificate = (qual: TeacherQualification) => {
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

  if (isQualsLoading || isExpLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full pb-10">
      {qualsError && (
        <ErrorAlert
          message={getErrorMessage(
            qualsError,
            "Failed to load education qualifications."
          )}
        />
      )}
      {expError && (
        <ErrorAlert
          message={getErrorMessage(
            expError,
            "Failed to load work experience."
          )}
        />
      )}
      {deleteQualMutation.error && (
        <ErrorAlert
          message={getErrorMessage(
            deleteQualMutation.error,
            "Failed to delete qualification."
          )}
        />
      )}
      {deleteExpMutation.error && (
        <ErrorAlert
          message={getErrorMessage(
            deleteExpMutation.error,
            "Failed to delete work experience."
          )}
        />
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-1.5">
            <span>Education / qualifications</span>
            <span className="text-muted-foreground font-normal">
              ({qualifications.length})
            </span>
          </h2>

          <button
            type="button"
            onClick={handleOpenAddQual}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-none bg-card hover:bg-muted/70 text-foreground text-xs font-semibold border border-border shadow-2xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add qualification</span>
          </button>
        </div>

        {qualifications.length === 0 ? (
          <div className="bg-card rounded-none border border-border p-6 text-center shadow-xs">
            <p className="text-xs text-muted-foreground">
              No education or qualifications added yet.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-none border border-border divide-y divide-border overflow-hidden shadow-xs">
            {qualifications.map((qual) => {
              const hasDoc = Boolean(qual.documentUrl);
              const isPdf = isPdfDocument(qual.documentUrl);
              const isImage = isImageDocument(qual.documentUrl);
              const levelLabel =
                QUALIFICATION_LEVEL_LABELS[qual.level] || qual.level;

              return (
                <div
                  key={qual.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                    <div
                      onClick={() => {
                        if (hasDoc) handlePreviewCertificate(qual);
                      }}
                      className={`relative w-16 h-14 sm:w-20 sm:h-16 rounded-none overflow-hidden flex items-center justify-center shrink-0 border transition-all group/thumb ${
                        hasDoc
                          ? "bg-card border-border cursor-pointer hover:border-foreground/40 hover:shadow-xs"
                          : "bg-muted/30 text-muted-foreground/40 border-border/40"
                      }`}
                      title={hasDoc ? "Click to view certificate" : "No certificate attached"}
                    >
                      {hasDoc ? (
                        <>
                          {isImage && qual.documentUrl ? (
                            <Image
                              src={qual.documentUrl}
                              alt="Certificate preview"
                              fill
                              unoptimized
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : isPdf && qual.documentUrl ? (
                            <div className="relative w-full h-full overflow-hidden bg-muted/20">
                              <iframe
                                src={`${qual.documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                title="PDF preview thumbnail"
                                className="w-[300%] h-[300%] origin-top-left scale-[0.33] pointer-events-none border-0 select-none"
                              />
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-card/90 border border-border text-[9px] font-bold text-foreground shadow-2xs">
                                PDF
                              </div>
                            </div>
                          ) : (
                            <FileText size={22} className="text-muted-foreground" />
                          )}

                          <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-card/90 text-foreground border border-border opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-xs pointer-events-none">
                            <ArrowUpRight
                              size={13}
                              className="transform group-hover/thumb:translate-x-0.5 group-hover/thumb:-translate-y-0.5 transition-transform"
                            />
                          </div>
                        </>
                      ) : (
                        <FileX size={22} className="opacity-40" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {levelLabel} — {qual.fieldOfStudy}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
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

                  <QualificationMenu
                    qualification={qual}
                    onEdit={() => handleOpenEditQual(qual)}
                    onDelete={() => handleDeleteQual(qual.id)}
                    onPreview={
                      hasDoc ? () => handlePreviewCertificate(qual) : undefined
                    }
                    isDeleting={deletingQualId === qual.id}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-1.5">
            <span>Work experience</span>
            <span className="text-muted-foreground font-normal">
              ({experiences.length})
            </span>
          </h2>

          <button
            type="button"
            onClick={handleOpenAddExp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-none bg-card hover:bg-muted/70 text-foreground text-xs font-semibold border border-border shadow-2xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add experience</span>
          </button>
        </div>

        {experiences.length === 0 ? (
          <div className="bg-card rounded-none border border-border p-6 text-center shadow-xs">
            <p className="text-xs text-muted-foreground">
              No work experience records added yet.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-none border border-border p-4 sm:p-6 shadow-xs">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {experiences.map((exp) => {
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
                  <div
                    key={exp.id}
                    className="relative flex items-start justify-between gap-3 group"
                  >
                    <div
                      className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ${
                        isCurrent
                          ? "bg-blue-500 ring-4 ring-blue-500/20"
                          : "bg-muted-foreground/60"
                      }`}
                    />

                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">
                        {exp.position || "Teacher"} — {exp.institution}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                        {dateRange}
                        {duration && <span> · {duration}</span>}
                      </p>
                    </div>

                    <ExperienceMenu
                      onEdit={() => handleOpenEditExp(exp)}
                      onDelete={() => handleDeleteExp(exp.id)}
                      isDeleting={deletingExpId === exp.id}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <QualificationFormModal
        isOpen={isQualModalOpen}
        onClose={() => setIsQualModalOpen(false)}
        qualificationToEdit={selectedQualification}
      />

      <ExperienceFormModal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        experienceToEdit={selectedExperience}
      />

      <DocumentPreviewModal
        isOpen={Boolean(previewDocUrl)}
        onClose={() => setPreviewDocUrl(null)}
        documentUrl={previewDocUrl}
        title={previewDocTitle}
        subtitle={previewDocSubtitle}
      />
    </div>
  );
}
