"use client";

import { useState } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  User,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import {
  AssessmentAttemptResult,
  AssessmentItem,
} from "../types/assessment.types";
import { getAttemptStatusBadge, formatPercentage } from "@/shared/utils/assessment.util";

interface AssessmentResultsViewProps {
  readonly assessment: AssessmentItem;
  readonly attempts: readonly AssessmentAttemptResult[];
  readonly onOpenManualGrade: (attempt: AssessmentAttemptResult) => void;
  readonly onBack: () => void;
}

export function AssessmentResultsView({
  assessment,
  attempts,
  onOpenManualGrade,
  onBack,
}: AssessmentResultsViewProps) {
  const [search, setSearch] = useState("");

  const filteredAttempts = attempts.filter((att) => {
    const studentName = `${att.student?.user?.firstName || ""} ${
      att.student?.user?.lastName || ""
    }`.toLowerCase();
    const code = (att.student?.studentCode || "").toLowerCase();
    const q = search.toLowerCase();
    return studentName.includes(q) || code.includes(q);
  });

  const gradedAttempts = attempts.filter((a) => a.status === "GRADED");
  const averagePercentage =
    gradedAttempts.length > 0
      ? Math.round(
          gradedAttempts.reduce((acc, a) => acc + (Number(a.percentage) || 0), 0) /
            gradedAttempts.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-primary font-semibold hover:underline mb-1 inline-flex items-center gap-1"
          >
            ← Back to Assessments
          </button>
          <h1 className="text-xl font-bold text-foreground">{assessment.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Student attempt results, completion metrics, and grading queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-card border border-border flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Class Average:</span>
            <span className="font-bold text-sm text-primary">
              {gradedAttempts.length > 0 ? `${averagePercentage}%` : "N/A"}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-card border border-border flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Total Attempts:</span>
            <span className="font-bold text-sm text-foreground">{attempts.length}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name or code..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Attempt #</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No attempts recorded yet for this assessment.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((attempt) => {
                  const badge = getAttemptStatusBadge(attempt.status);
                  const studentName = attempt.student?.user
                    ? `${attempt.student.user.firstName} ${attempt.student.user.lastName}`
                    : "Unknown Student";

                  return (
                    <tr key={attempt.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <User size={14} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground block truncate">
                              {studentName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {attempt.student?.studentCode || "No Code"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        #{attempt.attemptNumber}
                      </td>

                      <td className="py-3 px-4 font-medium text-foreground">
                        {attempt.score !== null && attempt.score !== undefined
                          ? `${attempt.score} / ${attempt.maxScore || "-"}`
                          : "-"}
                      </td>

                      <td className="py-3 px-4 font-bold text-foreground">
                        {formatPercentage(attempt.score, attempt.maxScore)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString()
                          : "-"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {attempt.status === "GRADING" ? (
                          <button
                            type="button"
                            onClick={() => onOpenManualGrade(attempt)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer"
                          >
                            Grade Now
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenManualGrade(attempt)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
