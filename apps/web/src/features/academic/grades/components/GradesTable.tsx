"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, UserX, CheckCircle2 } from "lucide-react";
import { LoadingSpinner } from "@/shared/components";
import {
  formatGradeName,
  getGradeCategoryLabel,
  formatGradeStreamLabel,
} from "@/shared/utils/grade.util";
import { GradeItem } from "../types/grade.types";
import { useToggleGradeStatus } from "../hooks/useGrades";

interface GradesTableProps {
  readonly items: readonly GradeItem[];
  readonly onViewDetails: (grade: GradeItem) => void;
  readonly isReadOnly?: boolean;
}

function GradeRowActions({
  grade,
  onViewDetails,
  onToggleStatus,
  isToggling,
  isReadOnly = false,
}: {
  readonly grade: GradeItem;
  readonly onViewDetails: (grade: GradeItem) => void;
  readonly onToggleStatus: (grade: GradeItem) => void;
  readonly isToggling: boolean;
  readonly isReadOnly?: boolean;
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
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isToggling}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Actions"
      >
        {isToggling ? <LoadingSpinner size={14} /> : <MoreVertical size={16} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 w-40 bg-card border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in-0 zoom-in-95">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onViewDetails(grade);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            <Eye size={13} className="text-muted-foreground" />
            <span>View Details</span>
          </button>

          {!isReadOnly && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onToggleStatus(grade);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
            >
              {grade.isActive ? (
                <>
                  <UserX size={13} className="text-destructive" />
                  <span className="text-destructive">Deactivate</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} className="text-muted-foreground" />
                  <span className="text-foreground">Activate</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function GradesTable({
  items,
  onViewDetails,
  isReadOnly = false,
}: GradesTableProps) {
  const toggleMutation = useToggleGradeStatus();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleStatus = async (grade: GradeItem) => {
    setTogglingId(grade.id);
    try {
      await toggleMutation.mutateAsync(grade.id);
    } finally {
      setTogglingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-xs">
        <p className="text-xs text-muted-foreground">
          No grade levels found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="md:hidden space-y-3">
        {items.map((grade) => {
          const availableStreams = grade.availableStreams || ["NONE"];
          const streamsLabel =
            availableStreams.length > 1
              ? "Natural & Social Science"
              : formatGradeStreamLabel(availableStreams[0]);

          return (
            <div
              key={grade.id}
              onClick={() => onViewDetails(grade)}
              className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-3 transition-colors cursor-pointer hover:border-foreground/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {formatGradeName(grade.level)}
                    </p>
                    <span className="inline-flex px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-muted text-muted-foreground border border-border">
                      {getGradeCategoryLabel(grade.level)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {streamsLabel}
                  </p>
                </div>

                <div
                  className="shrink-0 flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GradeRowActions
                    grade={grade}
                    onViewDetails={onViewDetails}
                    onToggleStatus={handleToggleStatus}
                    isToggling={togglingId === grade.id}
                    isReadOnly={isReadOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-xs text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Sections
                  </span>
                  <p className="text-xs font-semibold text-foreground">
                    {grade.sectionCount}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Students
                  </span>
                  <p className="text-xs font-semibold text-foreground">
                    {grade.studentCount}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Status
                  </span>
                  <span className="font-medium text-foreground text-xs">
                    {grade.isActive ? "Active" : "Inactive"}
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
                <th className="py-3.5 px-4">Grade Level</th>
                <th className="py-3.5 px-4">Educational Category</th>
                <th className="py-3.5 px-4">Curriculum Streams</th>
                <th className="py-3.5 px-4">Active Sections</th>
                <th className="py-3.5 px-4">Enrolled Students</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((grade) => {
                const availableStreams = grade.availableStreams || ["NONE"];
                const streamsLabel =
                  availableStreams.length > 1
                    ? "Natural & Social Science"
                    : formatGradeStreamLabel(availableStreams[0]);

                return (
                  <tr
                    key={grade.id}
                    onClick={() => onViewDetails(grade)}
                    className="hover:bg-muted/20 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground truncate group-hover:text-foreground/80 transition-colors">
                        {formatGradeName(grade.level)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-muted-foreground">
                      {getGradeCategoryLabel(grade.level)}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      {streamsLabel}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {grade.sectionCount} {grade.sectionCount === 1 ? "Section" : "Sections"}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {grade.studentCount} Students
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-foreground text-xs">
                        {grade.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <GradeRowActions
                          grade={grade}
                          onViewDetails={onViewDetails}
                          onToggleStatus={handleToggleStatus}
                          isToggling={togglingId === grade.id}
                          isReadOnly={isReadOnly}
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
