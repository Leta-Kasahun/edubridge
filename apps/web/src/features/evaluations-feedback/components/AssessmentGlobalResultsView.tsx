"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Search,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Eye,
  X,
} from "lucide-react";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import {
  useAssessments,
  useAssessmentAttempts,
  AssessmentGradeTabs,
} from "@/features/assessments";
import { useManualGradeAttempt } from "../hooks/useEvaluations";
import {
  AssessmentAttemptResult,
  ManualGradeAttemptPayload,
} from "../types/evaluation.types";
import { AssessmentManualGradeModal } from "./AssessmentManualGradeModal";
import { useGrades } from "@/features/academic";
import {
  getAttemptStatusBadge,
  formatPercentage,
} from "@/shared/utils/assessment.util";
import { ASSESSMENT_TYPE_LABELS } from "@/shared/constants/assessment.constants";

type SortField = "student" | "score" | "percentage" | "status" | "submitted";
type SortDirection = "asc" | "desc";

interface SortableHeaderProps {
  readonly label: string;
  readonly field: SortField;
  readonly currentField: SortField;
  readonly currentDirection: SortDirection;
  readonly onSort: (field: SortField) => void;
}

function SortableHeader({
  label,
  field,
  currentField,
  currentDirection,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentField === field;
  const isAsc = isActive && currentDirection === "asc";
  const isDesc = isActive && currentDirection === "desc";

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer select-none group"
      title={`Sort by ${label} (${isActive ? (isAsc ? "Ascending" : "Descending") : "Click to sort"})`}
    >
      <span>{label}</span>
      {isActive ? (
        isAsc ? (
          <ArrowUp size={13} className="text-primary font-bold shrink-0" />
        ) : (
          <ArrowDown size={13} className="text-primary font-bold shrink-0" />
        )
      ) : (
        <ChevronsUpDown size={13} className="text-muted-foreground/40 group-hover:text-foreground transition-colors shrink-0" />
      )}
    </button>
  );
}

interface AttemptRowActionsProps {
  readonly attempt: AssessmentAttemptResult;
  readonly onGradeReview: (attempt: AssessmentAttemptResult) => void;
  readonly isBusy?: boolean;
}

function AttemptRowActions({ attempt, onGradeReview, isBusy = false }: AttemptRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 90;

    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(10, rect.top - menuHeight - 4);
    }

    let left = rect.right - menuWidth;
    if (left < 10) {
      left = 10;
    } else if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
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

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        disabled={isBusy}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden cursor-pointer disabled:opacity-50 transition-colors"
        aria-label="Submission Actions"
        aria-expanded={isOpen}
      >
        {isBusy ? <LoadingSpinner size={14} /> : <MoreVertical size={16} />}
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
            className="w-48 bg-card text-foreground border border-border rounded-xl shadow-xl p-1 animate-in fade-in-0 zoom-in-95 text-xs select-none whitespace-nowrap"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onGradeReview(attempt);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left font-medium"
            >
              <Award size={14} className="text-primary shrink-0" />
              <span>Grade Attempt</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onGradeReview(attempt);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left font-medium"
            >
              <Eye size={14} className="shrink-0" />
              <span>Preview Answers</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

export function AssessmentGlobalResultsView() {
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState<SortField>("submitted");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [manualGradingAttempt, setManualGradingAttempt] = useState<AssessmentAttemptResult | null>(null);

  const { data: gradesData } = useGrades();
  const grades = gradesData || [];

  const { data: assessmentsData, isLoading: isLoadingAssessments, error: assessmentsError } = useAssessments();
  const assessments = assessmentsData?.items || [];

  // Filter assessments based on selected grade tab
  const gradeFilteredAssessments = useMemo(() => {
    if (!selectedGradeId) return assessments;
    return assessments.filter((a) =>
      a.assignments?.some((as) => as.section?.grade?.id === selectedGradeId)
    );
  }, [assessments, selectedGradeId]);

  // Default to first valid assessment in the grade
  const activeAssessmentId = useMemo(() => {
    if (selectedAssessmentId && gradeFilteredAssessments.some((a) => a.id === selectedAssessmentId)) {
      return selectedAssessmentId;
    }
    return gradeFilteredAssessments[0]?.id || assessments[0]?.id || "";
  }, [selectedAssessmentId, gradeFilteredAssessments, assessments]);

  const activeAssessment = useMemo(() => {
    return assessments.find((a) => a.id === activeAssessmentId) || null;
  }, [assessments, activeAssessmentId]);

  const {
    data: attemptsData,
    isLoading: isLoadingAttempts,
    error: attemptsError,
  } = useAssessmentAttempts(activeAssessmentId, {});
  const attempts = attemptsData?.items || [];

  const manualGradeMutation = useManualGradeAttempt();

  const assessmentOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const list = gradeFilteredAssessments.length > 0 ? gradeFilteredAssessments : assessments;
    return list.map((a) => ({
      value: a.id,
      label: `${a.title} (${ASSESSMENT_TYPE_LABELS[a.type] || a.type})`,
    }));
  }, [gradeFilteredAssessments, assessments]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(
        field === "percentage" || field === "score" || field === "submitted" ? "desc" : "asc"
      );
    }
  };

  const validStudentAttempts = useMemo(() => {
    return attempts.filter(
      (att) => !att.isStaffPreview && !att.id.startsWith("preview-")
    );
  }, [attempts]);

  const sortedAndFilteredAttempts = useMemo(() => {
    const list = validStudentAttempts.filter((att) => {
      if (statusFilter !== "ALL" && att.status !== statusFilter) return false;
      const studentName = `${att.student?.user?.firstName || ""} ${
        att.student?.user?.lastName || ""
      }`.toLowerCase();
      const code = (att.student?.studentCode || "").toLowerCase();
      const q = search.trim().toLowerCase();
      return !q || studentName.includes(q) || code.includes(q);
    });

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === "student") {
        const nameA = `${a.student?.user?.firstName || ""} ${a.student?.user?.lastName || ""}`.trim();
        const nameB = `${b.student?.user?.firstName || ""} ${b.student?.user?.lastName || ""}`.trim();
        cmp = nameA.localeCompare(nameB);
      } else if (sortField === "score") {
        const scoreA = Number(a.score) || 0;
        const scoreB = Number(b.score) || 0;
        cmp = scoreA - scoreB;
      } else if (sortField === "percentage") {
        const pctA = a.percentage != null
          ? Number(a.percentage)
          : Number(formatPercentage(a.score, a.maxScore || 100).replace("%", "")) || 0;
        const pctB = b.percentage != null
          ? Number(b.percentage)
          : Number(formatPercentage(b.score, b.maxScore || 100).replace("%", "")) || 0;
        cmp = pctA - pctB;
      } else if (sortField === "status") {
        cmp = (a.status || "").localeCompare(b.status || "");
      } else if (sortField === "submitted") {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        cmp = dateA - dateB;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [validStudentAttempts, search, statusFilter, sortField, sortDirection]);

  const gradedAttempts = useMemo(() => {
    return validStudentAttempts.filter((a) => a.status === "GRADED");
  }, [validStudentAttempts]);

  const averagePercentage =
    gradedAttempts.length > 0
      ? Math.round(
          gradedAttempts.reduce((acc, a) => acc + (Number(a.percentage) || 0), 0) /
            gradedAttempts.length
        )
      : 0;

  if (isLoadingAssessments) {
    return (
      <div className="p-12 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (assessmentsError || attemptsError) {
    return (
      <ErrorAlert
        title="Unable to load results"
        message="We could not load assessment submissions at this time."
      />
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-16">
      {/* Enterprise Single-Row Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
            Results & Grading
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="px-3 py-1 rounded-xl bg-card border border-border flex items-center gap-1.5 shadow-2xs">
            <span className="text-xs text-muted-foreground">Class Average:</span>
            <span className="font-bold text-xs text-primary">
              {gradedAttempts.length > 0 ? `${averagePercentage}%` : "—"}
            </span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-card border border-border flex items-center gap-1.5 shadow-2xs">
            <span className="text-xs text-muted-foreground">Submissions:</span>
            <span className="font-bold text-xs text-foreground">{attempts.length}</span>
          </div>
        </div>
      </div>

      {/* Grade Tabs Filter */}
      {grades.length > 0 && (
        <AssessmentGradeTabs
          grades={grades}
          selectedGradeId={selectedGradeId}
          onSelectGrade={(gradeId) => {
            setSelectedGradeId(gradeId);
            const matching = gradeId
              ? assessments.filter((a) =>
                  a.assignments?.some((as) => as.section?.grade?.id === gradeId)
                )
              : assessments;
            if (matching.length > 0 && !matching.some((a) => a.id === activeAssessmentId)) {
              setSelectedAssessmentId(matching[0].id);
            }
          }}
          assessments={assessments}
        />
      )}

      {/* Filter Toolbar (Search on LEFT, Assessment Dropdown, Status Filter) */}
      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
          {/* Search Input on the LEFT */}
          <div className="flex-1 min-w-[220px] relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name or code..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Assessment Dropdown */}
          <div className="w-full sm:w-80 min-w-[200px]">
            <SelectDropdown
              value={activeAssessmentId}
              onChange={(val) => setSelectedAssessmentId(val)}
              options={assessmentOptions}
              placeholder="Select Assessment"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-44 min-w-[140px]">
            <SelectDropdown
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: "All Statuses", value: "ALL" },
                { label: "Graded", value: "GRADED" },
                { label: "Submitted", value: "SUBMITTED" },
                { label: "In Progress", value: "IN_PROGRESS" },
              ]}
              placeholder="Filter Status"
            />
          </div>
        </div>
      </div>

      {/* Submissions Table with Enterprise Clean Sort Headers */}
      {isLoadingAttempts ? (
        <div className="p-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : attempts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center bg-card shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <Award size={24} />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            No Submissions Recorded
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            There are no student attempts submitted for this assessment yet.
          </p>
        </div>
      ) : sortedAndFilteredAttempts.length === 0 ? (
        <div className="rounded-2xl border border-border p-8 text-center bg-card shadow-xs">
          <p className="text-xs text-muted-foreground mb-2">
            No student submissions match your current search and filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold select-none">
                  <th className="p-3.5 whitespace-nowrap">
                    <SortableHeader
                      label="Student"
                      field="student"
                      currentField={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="p-3.5 whitespace-nowrap">
                    <SortableHeader
                      label="Score"
                      field="score"
                      currentField={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="p-3.5 whitespace-nowrap">
                    <SortableHeader
                      label="Percentage"
                      field="percentage"
                      currentField={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="p-3.5 whitespace-nowrap">
                    <SortableHeader
                      label="Status"
                      field="status"
                      currentField={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="p-3.5 whitespace-nowrap">
                    <SortableHeader
                      label="Submitted"
                      field="submitted"
                      currentField={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="p-3.5 text-right font-semibold text-muted-foreground whitespace-nowrap pr-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedAndFilteredAttempts.map((att) => {
                  const studentName = `${att.student?.user?.firstName || ""} ${
                    att.student?.user?.lastName || ""
                  }`.trim() || att.student?.studentCode || "Student";
                  const statusBadge = getAttemptStatusBadge(att.status);
                  const pct = att.percentage != null
                    ? Math.round(Number(att.percentage))
                    : Number(formatPercentage(att.score, att.maxScore || 100).replace("%", "")) || 0;

                  return (
                    <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-foreground">{studentName}</div>
                        {att.student?.studentCode && (
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {att.student.studentCode}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-foreground whitespace-nowrap">
                        {att.score != null ? `${att.score} pts` : "—"}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`font-bold font-mono ${
                            pct >= 75
                              ? "text-emerald-600 dark:text-emerald-400"
                              : pct >= 50
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-destructive"
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                        {att.submittedAt
                          ? new Date(att.submittedAt).toLocaleString()
                          : "In progress"}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap pr-4">
                        <AttemptRowActions
                          attempt={att}
                          onGradeReview={setManualGradingAttempt}
                          isBusy={manualGradeMutation.isPending}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Grading Modal */}
      {manualGradingAttempt && activeAssessment && (
        <AssessmentManualGradeModal
          isOpen={Boolean(manualGradingAttempt)}
          onClose={() => setManualGradingAttempt(null)}
          onSubmit={async (payload: ManualGradeAttemptPayload) => {
            await manualGradeMutation.mutateAsync({
              assessmentId: activeAssessment.id,
              attemptId: manualGradingAttempt.id,
              payload,
            });
            setManualGradingAttempt(null);
          }}
          assessmentId={activeAssessment.id}
          attemptId={manualGradingAttempt.id}
          initialAttempt={manualGradingAttempt}
          isLoading={manualGradeMutation.isPending}
        />
      )}
    </div>
  );
}
