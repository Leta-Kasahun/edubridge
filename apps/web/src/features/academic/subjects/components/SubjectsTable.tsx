"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit2, UserX, CheckCircle2, BookOpen } from "lucide-react";
import { LoadingSpinner } from "@/shared/components";
import { SubjectItem } from "../types/subject.types";
import { useToggleSubjectStatus } from "../hooks/useSubjects";
import { formatGradeLevelsSummary } from "@/shared/utils/subject.util";

interface SubjectsTableProps {
  readonly items: readonly SubjectItem[];
  readonly onViewDetails: (subject: SubjectItem) => void;
  readonly onEdit: (subject: SubjectItem) => void;
  readonly onAssignGrades: (subject: SubjectItem) => void;
}

function SubjectRowActions({
  subject,
  onViewDetails,
  onEdit,
  onAssignGrades,
  onToggleStatus,
  isToggling,
}: {
  readonly subject: SubjectItem;
  readonly onViewDetails: (subject: SubjectItem) => void;
  readonly onEdit: (subject: SubjectItem) => void;
  readonly onAssignGrades: (subject: SubjectItem) => void;
  readonly onToggleStatus: (subject: SubjectItem) => void;
  readonly isToggling: boolean;
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
              onViewDetails(subject);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            <Eye size={13} className="text-muted-foreground" />
            <span>View Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit(subject);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            <Edit2 size={13} className="text-muted-foreground" />
            <span>Edit Subject</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onAssignGrades(subject);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            <BookOpen size={13} className="text-muted-foreground" />
            <span>Assign Grades</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onToggleStatus(subject);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            {subject.isActive ? (
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
        </div>
      )}
    </div>
  );
}

export function SubjectsTable({
  items,
  onViewDetails,
  onEdit,
  onAssignGrades,
}: SubjectsTableProps) {
  const toggleMutation = useToggleSubjectStatus();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleStatus = async (subject: SubjectItem) => {
    setTogglingId(subject.id);
    try {
      await toggleMutation.mutateAsync(subject.id);
    } finally {
      setTogglingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-xs">
        <p className="text-xs text-muted-foreground">
          No subjects found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="md:hidden space-y-3">
        {items.map((sub) => (
          <div
            key={sub.id}
            onClick={() => onViewDetails(sub)}
            className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-3 transition-colors cursor-pointer hover:border-foreground/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                  {sub.name}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  {sub.code} · {formatGradeLevelsSummary(sub.assignedGradeLevels)}
                </p>
              </div>

              <div
                className="shrink-0 flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <SubjectRowActions
                  subject={sub}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onAssignGrades={onAssignGrades}
                  onToggleStatus={handleToggleStatus}
                  isToggling={togglingId === sub.id}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-xs text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  Grades
                </span>
                <p className="text-xs font-semibold text-foreground">
                  {sub.assignedGradeCount}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  Teachers
                </span>
                <p className="text-xs font-semibold text-foreground">
                  {sub.teacherAssignmentCount}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  Status
                </span>
                <span className="font-medium text-foreground text-xs">
                  {sub.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Assigned Grades</th>
                <th className="py-3.5 px-4">Active Teachers</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((sub) => (
                <tr
                  key={sub.id}
                  onClick={() => onViewDetails(sub)}
                  className="hover:bg-muted/20 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-foreground truncate group-hover:text-foreground/80 transition-colors">
                      {sub.name}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-muted-foreground">
                    {sub.code}
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground">
                    {formatGradeLevelsSummary(sub.assignedGradeLevels)}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {sub.teacherAssignmentCount} {sub.teacherAssignmentCount === 1 ? "Teacher" : "Teachers"}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-foreground text-xs">
                      {sub.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <SubjectRowActions
                        subject={sub}
                        onViewDetails={onViewDetails}
                        onEdit={onEdit}
                        onAssignGrades={onAssignGrades}
                        onToggleStatus={handleToggleStatus}
                        isToggling={togglingId === sub.id}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
