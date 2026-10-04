"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  FileCheck,
} from "lucide-react";
import { useStudentResults } from "../../hooks/useAssessmentAttempt";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { TableToolbar } from "@/shared/components/TableToolbar";
import {
  SelectDropdown,
  SelectDropdownOption,
} from "@/shared/components/SelectDropdown";
import { ROUTES } from "@/constants/routes";
import {
  ASSESSMENT_TYPES,
  ASSESSMENT_TYPE_LABELS,
} from "@/shared/constants/assessment.constants";
import { cn } from "@/lib/utils";

export function StudentResultsListView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [feedbackFilter, setFeedbackFilter] = useState<string>("ALL");

  const { data, isLoading, error } = useStudentResults({ limit: 50 });

  const items = useMemo(() => data?.items ?? [], [data]);

  const feedbackAvailableCount = useMemo(() => {
    return items.filter((item) => item.hasTeacherFeedback).length;
  }, [items]);

  const autoGradedCount = useMemo(() => {
    return items.filter((item) => !item.hasTeacherFeedback).length;
  }, [items]);

  const typeDropdownOptions: readonly SelectDropdownOption[] = useMemo(
    () => [
      { value: "ALL", label: "All Exam Types" },
      ...ASSESSMENT_TYPES.map((t) => ({
        value: t,
        label: ASSESSMENT_TYPE_LABELS[t] || t,
      })),
    ],
    []
  );

  const feedbackDropdownOptions: readonly SelectDropdownOption[] = useMemo(
    () => [
      { value: "ALL", label: "All Evaluations" },
      {
        value: "WITH_FEEDBACK",
        label: `With Feedback (${feedbackAvailableCount})`,
      },
      {
        value: "AUTO_GRADED",
        label: `Auto-Graded (${autoGradedCount})`,
      },
    ],
    [feedbackAvailableCount, autoGradedCount]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCode = item.subjectCode.toLowerCase().includes(query);
        const matchesSubject = item.subjectName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCode && !matchesSubject) {
          return false;
        }
      }
      if (selectedType !== "ALL" && item.type !== selectedType) {
        return false;
      }
      if (feedbackFilter === "WITH_FEEDBACK" && !item.hasTeacherFeedback) {
        return false;
      }
      if (feedbackFilter === "AUTO_GRADED" && item.hasTeacherFeedback) {
        return false;
      }
      return true;
    });
  }, [items, searchQuery, selectedType, feedbackFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3">
        <LoadingSpinner size={28} />
        <p className="text-xs text-muted-foreground font-medium">
          Loading your evaluations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 max-w-4xl mx-auto">
        <ErrorAlert
          title="Evaluations Error"
          message="Failed to load your evaluations. Please refresh or try again later."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 animate-in fade-in-0 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              My Evaluations
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Review your assessment results, scores, and instructor feedback.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link
            href={ROUTES.ASSESSMENTS.BASE}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-2xs"
          >
            <BookOpen size={13} />
            <span>Browse Exams</span>
          </Link>
        </div>
      </div>

      {/* Shared TableToolbar with SelectDropdown Filters */}
      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search evaluations by exam title, subject, or code..."
          actionButton={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <div className="w-full sm:w-44">
                <SelectDropdown
                  value={selectedType}
                  onChange={setSelectedType}
                  options={typeDropdownOptions}
                  placeholder="All Exam Types"
                />
              </div>
              <div className="w-full sm:w-52">
                <SelectDropdown
                  value={feedbackFilter}
                  onChange={setFeedbackFilter}
                  options={feedbackDropdownOptions}
                  placeholder="All Evaluations"
                />
              </div>
            </div>
          }
        />
      </div>

      {/* Evaluations List (Matching In-Progress Card Style) */}
      {filteredItems.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
            <FileCheck size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              No Evaluations Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {items.length === 0
                ? "Once you complete and submit an exam or quiz, your scores and teacher feedback will appear here."
                : "No evaluations match your current search or filter criteria."}
            </p>
          </div>
          {items.length === 0 && (
            <Link
              href={ROUTES.ASSESSMENTS.BASE}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              <span>Go to My Exams</span>
              <ChevronRight size={13} />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {filteredItems.map((item) => {
            const isPassed = Number(item.percentage) >= 50;
            const submittedDateStr = item.submittedAt
              ? new Date(item.submittedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Completed";

            return (
              <div
                key={item.id}
                className={cn(
                  "group rounded-2xl border border-border border-l-4 bg-card hover:bg-muted/20 transition-all p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0",
                  isPassed ? "border-l-emerald-500" : "border-l-amber-500"
                )}
              >
                <div className="space-y-2 min-w-0 flex-1">
                  {/* Badge & Title Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-muted text-muted-foreground shrink-0">
                      {item.subjectCode}
                    </span>

                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 text-primary shrink-0">
                      {ASSESSMENT_TYPE_LABELS[item.type] || item.type}
                    </span>

                    {item.hasTeacherFeedback ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1 shrink-0">
                        <MessageSquare size={11} />
                        Feedback Available
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground shrink-0 inline-flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        Auto-Graded
                      </span>
                    )}

                    <h3 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  {/* Progress & Score Bar (In-Progress style) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-24 sm:w-28 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isPassed ? "bg-emerald-500" : "bg-amber-500"
                          )}
                          style={{
                            width: `${Math.min(
                              Math.max(Number(item.percentage), 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="font-bold text-foreground shrink-0 text-xs">
                        {Math.round(Number(item.percentage))}%
                      </span>
                    </div>

                    <span className="shrink-0 text-[11px] sm:text-xs">
                      {Math.round(Number(item.score))} of {item.maxScore} pts
                    </span>

                    <span className="shrink-0 text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={11} />
                      {submittedDateStr}
                    </span>
                  </div>
                </div>

                {/* Action Link (In-Progress style) */}
                <div className="flex items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                  <Link
                    href={`/dashboard/assessments/${item.assessmentId}/attempts/${item.id}/result`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    <span>View Result</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
