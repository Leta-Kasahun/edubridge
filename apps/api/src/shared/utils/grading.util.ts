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
