"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  ArrowRightLeft,
  Layers,
  UserX,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TeacherAssignmentListItem } from "../types/teacher-assignment.types";
import { PaginationMeta } from "@/shared/types";
import {
  formatTeacherAssignmentRole,
  getTeacherLoadBadgeClass,
} from "@/shared/utils";

interface TeacherAssignmentsTableProps {
  readonly items: readonly TeacherAssignmentListItem[];
  readonly pagination?: PaginationMeta;
  readonly onPageChange?: (page: number) => void;
  readonly onLimitChange?: (limit: number) => void;
  readonly onReassign: (assignment: TeacherAssignmentListItem) => void;
  readonly onEndAssignment: (assignment: TeacherAssignmentListItem) => void;
  readonly onViewLoad: (assignment: TeacherAssignmentListItem) => void;
}

function TeacherRowActions({
  item,
  onReassign,
  onEndAssignment,
  onViewLoad,
}: {
  readonly item: TeacherAssignmentListItem;
  readonly onReassign: (assignment: TeacherAssignmentListItem) => void;
  readonly onEndAssignment: (assignment: TeacherAssignmentListItem) => void;
  readonly onViewLoad: (assignment: TeacherAssignmentListItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 184;
    const menuHeight = 140;

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

  const handleViewLoad = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onViewLoad(item);
  };

  const handleReassign = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onReassign(item);
  };

  const handleEndAssignment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onEndAssignment(item);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden cursor-pointer inline-flex items-center justify-center"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
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
              onClick={handleViewLoad}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Layers size={13} className="text-muted-foreground shrink-0" />
              <span>View Teacher Load</span>
            </button>

            <button
              type="button"
              onClick={handleReassign}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <ArrowRightLeft size={13} className="text-muted-foreground shrink-0" />
              <span>Reassign Teacher</span>
            </button>

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={handleEndAssignment}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
            >
              <UserX size={13} className="shrink-0" />
              <span>End Assignment</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

export function TeacherAssignmentsTable({
  items,
  pagination,
  onPageChange,
  onLimitChange,
  onReassign,
  onEndAssignment,
  onViewLoad,
}: TeacherAssignmentsTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-xs">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
          <GraduationCap size={24} />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">No teacher assignments found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No active teaching assignments match the current academic session or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Teacher</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Active Load</th>
                <th className="py-3 px-4 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{item.teacherName}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {item.employeeCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {formatTeacherAssignmentRole(item.role)}
                    </td>
                    <td className="py-3.5 px-4 text-foreground">
                      Grade {item.gradeLevel} — {item.sectionName}
                    </td>
                    <td className="py-3.5 px-4 text-foreground">
                      {item.subjectName ? (
                        <div>
                          <span className="font-medium">{item.subjectName}</span>
                          <span className="font-mono text-[10px] text-muted-foreground ml-1.5">
                            ({item.subjectCode})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onViewLoad(item)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer hover:opacity-80 ${getTeacherLoadBadgeClass(
                          item.teacherActiveLoad
                        )}`}
                        title="Click to view full workload"
                      >
                        {item.teacherActiveLoad} class{item.teacherActiveLoad > 1 ? "es" : ""}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <TeacherRowActions
                        item={item}
                        onReassign={onReassign}
                        onEndAssignment={onEndAssignment}
                        onViewLoad={onViewLoad}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-2.5">
        {items.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs space-y-2.5 relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-foreground truncate">{item.teacherName}</div>
                  <div className="text-[11px] font-mono text-muted-foreground truncate">
                    {item.employeeCode}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onViewLoad(item)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getTeacherLoadBadgeClass(
                      item.teacherActiveLoad
                    )}`}
                  >
                    {item.teacherActiveLoad} class{item.teacherActiveLoad > 1 ? "es" : ""}
                  </button>
                  <TeacherRowActions
                    item={item}
                    onReassign={onReassign}
                    onEndAssignment={onEndAssignment}
                    onViewLoad={onViewLoad}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">Role: </span>
                  <span className="font-semibold text-foreground">
                    {formatTeacherAssignmentRole(item.role)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Section: </span>
                  <span className="font-semibold text-foreground">
                    Grade {item.gradeLevel} — {item.sectionName}
                  </span>
                </div>
                {item.subjectName && (
                  <div className="w-full">
                    <span className="text-muted-foreground text-[11px]">Subject: </span>
                    <span className="font-semibold text-foreground">
                      {item.subjectName} ({item.subjectCode})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.total > 0 && (
        <div className="bg-card rounded-2xl border border-border px-3.5 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground shadow-xs">
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} assignments
            </span>
            {onLimitChange && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                <span className="text-[11px]">Rows:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="h-7 px-1.5 rounded-lg bg-background border border-border text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted text-foreground transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-medium text-foreground px-1">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted text-foreground transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
