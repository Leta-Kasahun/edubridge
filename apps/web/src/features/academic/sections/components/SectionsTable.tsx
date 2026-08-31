"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit2, UserX, CheckCircle2, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/shared/components";
import { SectionRecord } from "../types/section.types";
import { useUpdateSectionStatus, useDeleteSection } from "../hooks/useSections";
import { formatCapacityUtilization } from "@/shared/utils/section.util";
import { SECTION_STATUS_LABELS } from "@/shared/constants/section.constants";

interface SectionsTableProps {
  readonly items: readonly SectionRecord[];
  readonly onViewDetails: (section: SectionRecord) => void;
  readonly onEdit: (section: SectionRecord) => void;
}

function SectionRowActions({
  section,
  onViewDetails,
  onEdit,
  onToggleStatus,
  onDelete,
  isProcessing,
}: {
  readonly section: SectionRecord;
  readonly onViewDetails: (section: SectionRecord) => void;
  readonly onEdit: (section: SectionRecord) => void;
  readonly onToggleStatus: (section: SectionRecord) => void;
  readonly onDelete: (section: SectionRecord) => void;
  readonly isProcessing: boolean;
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

  const isActive = section.status === "ACTIVE";

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isProcessing}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Actions"
      >
        {isProcessing ? <LoadingSpinner size={14} /> : <MoreVertical size={16} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 w-40 bg-card border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in-0 zoom-in-95">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onViewDetails(section);
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
              onEdit(section);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            <Edit2 size={13} className="text-muted-foreground" />
            <span>Edit Section</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onToggleStatus(section);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            {isActive ? (
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

          {section.studentCount === 0 && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete(section);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer text-left"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function SectionsTable({
  items,
  onViewDetails,
  onEdit,
}: SectionsTableProps) {
  const updateStatusMutation = useUpdateSectionStatus();
  const deleteMutation = useDeleteSection();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleToggleStatus = async (section: SectionRecord) => {
    setProcessingId(section.id);
    const targetStatus = section.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateStatusMutation.mutateAsync({
        id: section.id,
        status: targetStatus,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (section: SectionRecord) => {
    setProcessingId(section.id);
    try {
      await deleteMutation.mutateAsync(section.id);
    } finally {
      setProcessingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-xs">
        <p className="text-xs text-muted-foreground">
          No sections found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="md:hidden space-y-3">
        {items.map((sec) => (
          <div
            key={sec.id}
            onClick={() => onViewDetails(sec)}
            className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-3 transition-colors cursor-pointer hover:border-foreground/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                  Section {sec.name}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Grade {sec.gradeLevel} · {sec.academicYearName}
                </p>
              </div>

              <div
                className="shrink-0 flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <SectionRowActions
                  section={sec}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  isProcessing={processingId === sec.id}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-xs text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  Homeroom
                </span>
                <p className="text-xs font-semibold text-foreground truncate">
                  {sec.homeroomTeacher?.fullName || "Unassigned"}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  Students
                </span>
                <p className="text-xs font-semibold text-foreground">
                  {sec.studentCount}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  Status
                </span>
                <span className="font-medium text-foreground text-xs">
                  {SECTION_STATUS_LABELS[sec.status]}
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
                <th className="py-3.5 px-4">Section</th>
                <th className="py-3.5 px-4">Grade Level</th>
                <th className="py-3.5 px-4">Academic Year</th>
                <th className="py-3.5 px-4">Homeroom Teacher</th>
                <th className="py-3.5 px-4">Enrolled Students</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((sec) => (
                <tr
                  key={sec.id}
                  onClick={() => onViewDetails(sec)}
                  className="hover:bg-muted/20 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-foreground truncate group-hover:text-foreground/80 transition-colors">
                      Section {sec.name}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-muted-foreground">
                    Grade {sec.gradeLevel}
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground truncate max-w-40">
                    {sec.academicYearName}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-foreground truncate max-w-40">
                    {sec.homeroomTeacher ? sec.homeroomTeacher.fullName : "Unassigned"}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {formatCapacityUtilization(sec.studentCount, sec.capacity)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-foreground text-xs">
                      {SECTION_STATUS_LABELS[sec.status]}
                    </span>
                  </td>

                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <SectionRowActions
                        section={sec}
                        onViewDetails={onViewDetails}
                        onEdit={onEdit}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete}
                        isProcessing={processingId === sec.id}
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
