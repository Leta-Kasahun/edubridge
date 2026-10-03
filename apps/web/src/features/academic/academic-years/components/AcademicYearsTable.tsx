"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Edit2, CheckCircle2, Eye, Archive, RotateCcw } from "lucide-react";
import { LoadingSpinner } from "@/shared/components";
import {
  formatAcademicDateRange,
  formatAcademicYearStatus,
} from "@/shared/utils/academic-year.util";
import { AcademicYearItem } from "../types/academic-year.types";
import {
  useSetActiveAcademicYear,
  useArchiveAcademicYear,
  useRestoreAcademicYear,
} from "../hooks/useAcademicYears";

interface AcademicYearsTableProps {
  readonly items: readonly AcademicYearItem[];
  readonly onEdit: (year: AcademicYearItem) => void;
  readonly onViewDetails: (year: AcademicYearItem) => void;
}

function YearRowActions({
  year,
  onEdit,
  onViewDetails,
  onSetActive,
  onArchive,
  onRestore,
  isProcessing,
}: {
  readonly year: AcademicYearItem;
  readonly onEdit: (year: AcademicYearItem) => void;
  readonly onViewDetails: (year: AcademicYearItem) => void;
  readonly onSetActive: (year: AcademicYearItem) => void;
  readonly onArchive: (year: AcademicYearItem) => void;
  readonly onRestore: (year: AcademicYearItem) => void;
  readonly isProcessing: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 192;
    const menuHeight = 190;

    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(10, rect.top - menuHeight - 4);
    }

    let left = rect.right - menuWidth;
    if (left < 10) {
      left = 10;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScroll = () => updatePosition();
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const isActive = year.status === "ACTIVE";
  const isArchived = year.status === "ARCHIVED";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        disabled={isProcessing}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden cursor-pointer disabled:opacity-50"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        {isProcessing ? <LoadingSpinner size={14} /> : <MoreVertical size={16} />}
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            className="w-48 bg-card text-foreground border border-border rounded-xl shadow-lg p-1 text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewDetails(year);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Eye size={13} className="text-muted-foreground shrink-0" />
              <span>View Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit(year);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Edit2 size={13} className="text-muted-foreground shrink-0" />
              <span>Edit</span>
            </button>

            {!isActive && !isArchived && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSetActive(year);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <CheckCircle2 size={13} className="shrink-0" />
                <span>Set as Active</span>
              </button>
            )}

            {(isArchived || !isActive) && <div className="my-1 border-t border-border" />}

            {isArchived ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onRestore(year);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <RotateCcw size={13} className="shrink-0" />
                <span>Restore</span>
              </button>
            ) : (
              !isActive && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onArchive(year);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
                >
                  <Archive size={13} className="shrink-0" />
                  <span>Archive</span>
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export function AcademicYearsTable({
  items,
  onEdit,
  onViewDetails,
}: AcademicYearsTableProps) {
  const setActiveMutation = useSetActiveAcademicYear();
  const archiveMutation = useArchiveAcademicYear();
  const restoreMutation = useRestoreAcademicYear();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSetActive = async (year: AcademicYearItem) => {
    setProcessingId(year.id);
    try {
      await setActiveMutation.mutateAsync(year.id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleArchive = async (year: AcademicYearItem) => {
    setProcessingId(year.id);
    try {
      await archiveMutation.mutateAsync(year.id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (year: AcademicYearItem) => {
    setProcessingId(year.id);
    try {
      await restoreMutation.mutateAsync(year.id);
    } finally {
      setProcessingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-xs">
        <p className="text-xs text-muted-foreground">
          No academic years found matching your search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="md:hidden space-y-3">
        {items.map((year) => {
          const dateRange = formatAcademicDateRange(year.startDate, year.endDate);
          const statusLabel = formatAcademicYearStatus(year.status);

          return (
            <div
              key={year.id}
              className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {year.name}
                    </p>
                    <span className="inline-flex px-1.5 py-0.2 rounded-md text-[9px] font-mono font-semibold bg-muted text-muted-foreground border border-border">
                      {year.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {dateRange}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  <YearRowActions
                    year={year}
                    onEdit={onEdit}
                    onViewDetails={onViewDetails}
                    onSetActive={handleSetActive}
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    isProcessing={processingId === year.id}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Class Cohorts
                  </span>
                  <p className="text-[11px] font-medium text-foreground">
                    {year.sectionCount} {year.sectionCount === 1 ? "Section" : "Sections"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {year.studentEnrollmentCount} Students enrolled
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Status
                  </span>
                  <span className="font-medium text-foreground text-xs">
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Academic Year</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Date Range</th>
                <th className="py-3.5 px-4">Sections & Students</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((year) => {
                const dateRange = formatAcademicDateRange(year.startDate, year.endDate);
                const statusLabel = formatAcademicYearStatus(year.status);

                return (
                  <tr key={year.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground truncate">
                        {year.name}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-muted-foreground">
                      {year.code}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      {dateRange}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-foreground">
                        {year.sectionCount} {year.sectionCount === 1 ? "Section" : "Sections"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {year.studentEnrollmentCount} Students enrolled
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-foreground text-xs">
                        {statusLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <YearRowActions
                          year={year}
                          onEdit={onEdit}
                          onViewDetails={onViewDetails}
                          onSetActive={handleSetActive}
                          onArchive={handleArchive}
                          onRestore={handleRestore}
                          isProcessing={processingId === year.id}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
