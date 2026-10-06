import Link from "next/link";
import { Clock, ShieldAlert, FileText, ArrowLeft, Target, Eye } from "lucide-react";
import { AssessmentItem } from "../../types/assessment.types";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { formatMinutes } from "@/shared/utils/assessment.util";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth.store";

interface StudentAssessmentEntryViewProps {
  readonly assessment: AssessmentItem;
  readonly assignmentId: string;
  readonly onStart: () => Promise<void>;
  readonly isLoading?: boolean;
}

export function StudentAssessmentEntryView({
  assessment,
  assignmentId,
  onStart,
  isLoading = false,
}: StudentAssessmentEntryViewProps) {
  const user = useAuthStore((s) => s.user);
  const isTeacherOrStaff = Boolean(
    user?.roles?.some((r) => ["TEACHER", "SCHOOL_ADMIN", "SYSTEM_ADMIN"].includes(r)) &&
      !user?.roles?.includes("STUDENT")
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Link
            href={ROUTES.ASSESSMENTS.BASE}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-muted"
          >
            <ArrowLeft size={16} />
            <span>Exit to Exams</span>
          </Link>

          <div className="flex items-center gap-2 truncate">
            {isTeacherOrStaff && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                Teacher Preview
              </span>
            )}
            <span className="text-xs font-bold text-foreground truncate">
              {assessment.title}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1 flex flex-col justify-center">
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            {isTeacherOrStaff && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5 font-medium leading-relaxed">
                <Eye size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>Teacher Preview Mode:</strong> You are previewing this assessment. Responses and test submissions in preview mode will not affect student grades, class averages, or analytics.
                </span>
              </div>
            )}

            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
                {assessment.type} Exam
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {assessment.title}
              </h1>
              {assessment.description && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {assessment.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                  Duration
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Clock size={14} className="text-primary" />
                  {assessment.timeLimitMinutes
                    ? formatMinutes(assessment.timeLimitMinutes)
                    : "Untimed"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                  Questions
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" />
                  {assessment._count?.questions || assessment.questions?.length || "Dynamic"} Items
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                  Grading Standard
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Target size={14} className="text-emerald-600 dark:text-emerald-400" />
                  Pass Mark 50%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2.5 text-xs text-muted-foreground">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-500" />
                Exam Guidelines:
              </span>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Once started, the countdown timer runs continuously on the server.</li>
                <li>Your answers are automatically saved as you make selections.</li>
                <li>You can flag questions to review before final submission.</li>
                <li>The exam will automatically submit when the remaining time expires.</li>
              </ul>
            </div>

            <div className="pt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-border">
              <Link
                href={ROUTES.ASSESSMENTS.BASE}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors text-center shrink-0 cursor-pointer"
              >
                Cancel
              </Link>
              <SubmitButton
                onClick={onStart}
                isLoading={isLoading}
                loadingText="Preparing Exam Session..."
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Start Exam Now
              </SubmitButton>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 py-3 text-center text-xs text-muted-foreground">
        Secure Digital Exam Environment · Answers are synchronized automatically
      </footer>
    </div>
  );
}
