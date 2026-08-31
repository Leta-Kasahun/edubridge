"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  ArrowRightLeft,
  History,
  UserMinus,
  CheckSquare,
  Square,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { StudentRosterItem } from "../types/student-assignment.types";
import { PaginationMeta } from "@/shared/types";
import { getEnrollmentStatusBadgeClass, formatEnrollmentStatus } from "@/shared/utils";

interface StudentAssignmentsTableProps {
  readonly items: readonly StudentRosterItem[];
  readonly selectedStudentIds: readonly string[];
  readonly pagination?: PaginationMeta;
  readonly onPageChange?: (page: number) => void;
  readonly onLimitChange?: (limit: number) => void;
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

  const handleTransfer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onTransferSingle(item);
  };

  const handleHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onShowHistory(item);
  };

  const handleWithdraw = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onWithdraw(item);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer inline-flex items-center justify-center"
        aria-label="Actions"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-9 w-48 rounded-xl bg-card border border-border shadow-xl p-1 z-50 flex flex-col text-xs animate-in fade-in-0 zoom-in-95"
        >
          <button
            type="button"
            onClick={handleTransfer}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer text-left"
          >
            <ArrowRightLeft size={14} className="text-muted-foreground" />
            <span>Transfer Section</span>
          </button>

          <button
            type="button"
            onClick={handleHistory}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer text-left"
          >
            <History size={14} className="text-muted-foreground" />
            <span>Enrollment History</span>
          </button>

          <div className="my-1 border-t border-border" />

          <button
            type="button"
            onClick={handleWithdraw}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left"
          >
            <UserMinus size={14} />
            <span>Withdraw Student</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function StudentAssignmentsTable({
  items,
  selectedStudentIds,
  pagination,
  onPageChange,
  onLimitChange,
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
      <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
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
                      <div className="h-4 w-4 rounded-sm border border-primary bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-2 bg-primary rounded-xs" />
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
                      {item.fullName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {item.studentCode}
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
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getEnrollmentStatusBadgeClass(
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
              className={`bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs space-y-2.5 relative ${
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
                    <div className="text-xs font-bold text-foreground truncate">{item.fullName}</div>
                    <div className="text-[11px] font-mono text-muted-foreground truncate">
                      {item.studentCode}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getEnrollmentStatusBadgeClass(
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

      {/* Pagination Controls */}
      {pagination && pagination.total > 0 && (
        <div className="bg-card rounded-2xl border border-border px-3.5 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground shadow-xs">
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
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
