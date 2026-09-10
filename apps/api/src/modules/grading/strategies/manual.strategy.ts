import { GradingResult } from "./mcq.strategy.js";

export function gradeManualPending(): GradingResult {
  return {
    isCorrect: null,
    awardedPoints: 0,
    gradingStatus: "MANUAL_GRADING",
  };
}
