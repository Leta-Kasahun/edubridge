"use client";

import { useState, useRef, useEffect, useCallback, RefObject } from "react";

import { createPortal } from "react-dom";
import {
  MoreVertical,
  ArrowRightLeft,
  History,
  UserMinus,
  CheckSquare,
  Square,
  Users,
} from "lucide-react";
import { StudentRosterItem } from "../types/student-assignment.types";
import { getEnrollmentStatusBadgeClass, formatEnrollmentStatus } from "@/shared/utils";
import { SearchHighlight } from "@/shared/components";

interface StudentAssignmentsTableProps {
  readonly items: readonly StudentRosterItem[];
  readonly selectedStudentIds: readonly string[];
  readonly sentinelRef: RefObject<HTMLDivElement | null>;
  readonly isFetchingMore: boolean;
  readonly hasMore: boolean;
  readonly total: number;
  readonly onToggleSelect: (studentId: string) => void;
  readonly onSelectAll: (studentIds: readonly string[]) => void;
  readonly onClearSelection: () => void;
  readonly onTransferSingle: (student: StudentRosterItem) => void;
  readonly onShowHistory: (student: StudentRosterItem) => void;
  readonly onWithdraw: (student: StudentRosterItem) => void;
}

function StudentRowActions({
  item,
  onTransferSingle,
  onShowHistory,
  onWithdraw,
}: {
  readonly item: StudentRosterItem;
  readonly onTransferSingle: (student: StudentRosterItem) => void;
  readonly onShowHistory: (student: StudentRosterItem) => void;
  readonly onWithdraw: (student: StudentRosterItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 192;
    const menuHeight = 130;
    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(10, rect.top - menuHeight - 4);
    }
    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    setCoords({ top, left });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

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
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden transition-colors cursor-pointer inline-flex items-center justify-center"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && coords && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{ position: "fixed", top: `${coords.top}px`, left: `${coords.left}px`, zIndex: 9999 }}
          className="w-48 bg-card text-foreground border border-border rounded-xl shadow-lg p-1 text-xs"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onTransferSingle(item); }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
          >
            <ArrowRightLeft size={13} className="text-muted-foreground shrink-0" />
            <span>Transfer Section</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onShowHistory(item); }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
          >
            <History size={13} className="text-muted-foreground shrink-0" />
            <span>Enrollment History</span>
          </button>
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onWithdraw(item); }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
          >
            <UserMinus size={13} className="shrink-0" />
            <span>Withdraw Student</span>
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

export function StudentAssignmentsTable({
  items,
  selectedStudentIds,
  sentinelRef,
  isFetchingMore,
  hasMore,
  total,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onTransferSingle,
  onShowHistory,
  onWithdraw,
}: StudentAssignmentsTableProps) {
  const activeItems = items.filter((i) => i.status === "ACTIVE");
  const isAllSelected =
    activeItems.length > 0 && activeItems.every((i) => selectedStudentIds.includes(i.studentId));
  const isIndeterminate =
    selectedStudentIds.length > 0 && !isAllSelected;

  const handleHeaderCheckbox = () => {
    if (isAllSelected) {
      onClearSelection();
    } else {
      onSelectAll(activeItems.map((i) => i.studentId));
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-xs">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
          <Users size={24} />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">No enrolled students found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No students are currently enrolled under the selected academic year, grade, or section filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block bg-card rounded-none border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button
                    type="button"
                    onClick={handleHeaderCheckbox}
                    className="flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                    title={isAllSelected ? "Deselect all" : "Select all active"}
                  >
                    {isAllSelected ? (
                      <CheckSquare size={16} className="text-primary" />
                    ) : isIndeterminate ? (
                      <div className="h-4 w-4 rounded-none border border-primary bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-2 bg-primary rounded-none" />
                      </div>
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Student Code</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => {
                const isSelected = selectedStudentIds.includes(item.studentId);
                const isActive = item.status === "ACTIVE";

                return (
                  <tr
                    key={item.enrollmentId}
                    className={`hover:bg-muted/20 transition-colors ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        disabled={!isActive}
                        onClick={() => onToggleSelect(item.studentId)}
                        className={`flex items-center justify-center ${
                          isActive
                            ? "cursor-pointer text-muted-foreground hover:text-foreground"
                            : "opacity-30 cursor-not-allowed text-muted-foreground"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-primary" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <SearchHighlight text={item.fullName} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      <SearchHighlight text={item.studentCode} />
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground uppercase text-[11px]">
                      {item.gender}
                    </td>
                    <td className="py-3.5 px-4 text-foreground">
                      Grade {item.gradeLevel}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {item.sectionName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-none ${getEnrollmentStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {formatEnrollmentStatus(item.status)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StudentRowActions
                        item={item}
                        onTransferSingle={onTransferSingle}
                        onShowHistory={onShowHistory}
                        onWithdraw={onWithdraw}
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
          const isSelected = selectedStudentIds.includes(item.studentId);
          const isActive = item.status === "ACTIVE";

          return (
            <div
              key={item.enrollmentId}
              className={`bg-card rounded-none border border-border p-3.5 sm:p-4 shadow-xs space-y-2.5 relative ${
                isSelected ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    disabled={!isActive}
                    onClick={() => onToggleSelect(item.studentId)}
                    className={`mt-0.5 shrink-0 ${
                      isActive
                        ? "cursor-pointer text-muted-foreground hover:text-foreground"
                        : "opacity-30 cursor-not-allowed text-muted-foreground"
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-primary" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-foreground truncate">
                      <SearchHighlight text={item.fullName} />
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground truncate">
                      <SearchHighlight text={item.studentCode} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-none ${getEnrollmentStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {formatEnrollmentStatus(item.status)}
                  </span>
                  <StudentRowActions
                    item={item}
                    onTransferSingle={onTransferSingle}
                    onShowHistory={onShowHistory}
                    onWithdraw={onWithdraw}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">Grade: </span>
                  <span className="font-semibold text-foreground">
                    Grade {item.gradeLevel}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Section: </span>
                  <span className="font-semibold text-foreground">
                    {item.sectionName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Gender: </span>
                  <span className="font-semibold text-foreground uppercase">
                    {item.gender}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {total > 0 && (
        <div className="bg-card rounded-2xl border border-border px-3.5 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 text-xs text-muted-foreground shadow-xs">
          <span>
            Showing {items.length} of {total} students
          </span>
        </div>
      )}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingMore && (
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        )}
      </div>
    </div>
  );
}
