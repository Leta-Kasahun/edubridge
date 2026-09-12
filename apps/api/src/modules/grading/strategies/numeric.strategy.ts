import { GradingResult } from "./mcq.strategy.js";

interface NumericConfig {
  correctValue?: number;
  tolerance?: number;
  unit?: string;
}

export function gradeNumeric(
  studentResponse: unknown,
  configuration: unknown,
  maxPoints: number
): GradingResult {
  const config = (configuration as NumericConfig) || {};
  const correctVal = config.correctValue;

  if (typeof correctVal !== "number") {
    return {
      isCorrect: null,
      awardedPoints: 0,
      gradingStatus: "MANUAL_GRADING",
    };
  }

  let studentNum: number | null = null;
  if (typeof studentResponse === "number" && !Number.isNaN(studentResponse)) {
    studentNum = studentResponse;
  } else if (typeof studentResponse === "string") {
    const parsed = Number.parseFloat(studentResponse.trim());
    if (!Number.isNaN(parsed)) {
      studentNum = parsed;
    }
  } else if (
    studentResponse &&
    typeof studentResponse === "object" &&
    "value" in studentResponse
  ) {
    const raw = (studentResponse as { value: unknown }).value;
    if (typeof raw === "number" && !Number.isNaN(raw)) {
      studentNum = raw;
    } else if (typeof raw === "string") {
      const parsed = Number.parseFloat(raw.trim());
      if (!Number.isNaN(parsed)) {
        studentNum = parsed;
      }
    }
  }

  if (studentNum === null) {
    return {
      isCorrect: false,
      awardedPoints: 0,
      gradingStatus: "AUTO_GRADED",
    };
  }

  const tolerance = typeof config.tolerance === "number" ? Math.abs(config.tolerance) : 0;
  const isCorrect = Math.abs(studentNum - correctVal) <= tolerance;

  return {
    isCorrect,
    awardedPoints: isCorrect ? maxPoints : 0,
    gradingStatus: "AUTO_GRADED",
  };
}
