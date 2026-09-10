import { QuestionTypeEnum } from "../constants/question-bank.constants.js";

export function normalizeTextAnswer(answer: string | null | undefined): string {
  if (!answer) return "";
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isAutoGradable(type: QuestionTypeEnum): boolean {
  switch (type) {
    case "MCQ":
    case "TRUE_FALSE":
    case "NUMERIC":
      return true;
    case "SHORT_ANSWER":
    case "MATCHING":
    case "ORDERING":
    case "LONG_ANSWER":
    default:
      return false;
  }
}

export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  const percentage = (score / maxScore) * 100;
  return Math.round(percentage * 100) / 100;
}

export function getAttemptDeadline(
  startedAt: Date,
  timeLimitMinutes: number | null | undefined,
  gracePeriodSeconds: number = 30
): Date | null {
  if (!timeLimitMinutes || timeLimitMinutes <= 0) return null;
  const deadlineMs =
    new Date(startedAt).getTime() + (timeLimitMinutes * 60 + gracePeriodSeconds) * 1000;
  return new Date(deadlineMs);
}

export function isAttemptExpired(
  startedAt: Date,
  timeLimitMinutes: number | null | undefined,
  gracePeriodSeconds: number = 30
): boolean {
  const deadline = getAttemptDeadline(startedAt, timeLimitMinutes, gracePeriodSeconds);
  if (!deadline) return false;
  return Date.now() > deadline.getTime();
}
