import {
  AssessmentStatus,
  AttemptStatus,
  ASSESSMENT_STATUS_COLORS,
} from "../constants/assessment.constants";

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hrs}h ${remainder}m` : `${hrs}h`;
}

export function getDifficultyBadgeClass(difficulty?: string): string {
  switch (difficulty) {
    case "HARD":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    case "MEDIUM":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "EASY":
    default:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
}

export function formatPercentage(
  score: number | string | null | undefined,
  maxScore: number | string | null | undefined
): string {
  const numScore = Number(score) || 0;
  const numMax = Number(maxScore) || 0;
  if (numMax <= 0) return "0%";
  const pct = Math.round((numScore / numMax) * 100);
  return `${pct}%`;
}

export function isAssessmentAvailable(
  availableFrom?: string | null,
  availableUntil?: string | null
): { available: boolean; reason?: string } {
  const now = new Date().getTime();

  if (availableFrom) {
    const fromTime = new Date(availableFrom).getTime();
    if (!Number.isNaN(fromTime) && now < fromTime) {
      return {
        available: false,
        reason: `Opens on ${new Date(availableFrom).toLocaleDateString()}`,
      };
    }
  }

  if (availableUntil) {
    const untilTime = new Date(availableUntil).getTime();
    if (!Number.isNaN(untilTime) && now > untilTime) {
      return {
        available: false,
        reason: `Closed on ${new Date(availableUntil).toLocaleDateString()}`,
      };
    }
  }

  return { available: true };
}

export function getAssessmentStatusStyle(status: AssessmentStatus) {
  return ASSESSMENT_STATUS_COLORS[status] || ASSESSMENT_STATUS_COLORS.DRAFT;
}

export function getAttemptStatusBadge(status: AttemptStatus) {
  switch (status) {
    case "IN_PROGRESS":
      return {
        label: "In Progress",
        bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      };
    case "SUBMITTED":
      return {
        label: "Submitted",
        bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      };
    case "GRADING":
      return {
        label: "Pending Review",
        bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    case "GRADED":
      return {
        label: "Graded",
        bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    case "EXPIRED":
      return {
        label: "Expired",
        bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      };
    case "ABANDONED":
    default:
      return {
        label: "Abandoned",
        bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      };
  }
}
