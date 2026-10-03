import { QuestionType } from "../../generated/prisma/enums.js";
import type { QuestionOption } from "../../generated/prisma/client.js";
import { gradeMcq, GradingResult } from "./strategies/mcq.strategy.js";
import { gradeTrueFalse } from "./strategies/true-false.strategy.js";
import { gradeNumeric } from "./strategies/numeric.strategy.js";
import { gradeShortAnswer } from "./strategies/short-answer.strategy.js";
import { gradeManualPending } from "./strategies/manual.strategy.js";

export interface QuestionVersionForGrading {
  id: string;
  type: QuestionType;
  points: number | string | { toNumber?: () => number };
  configuration?: unknown;
  options?: QuestionOption[];
}

export class GradingEngine {
  public static gradeResponse(
    question: QuestionVersionForGrading,
    studentResponse: unknown
  ): GradingResult {
    const rawPoints = question.points;
    const maxPoints =
      typeof rawPoints === "number"
        ? rawPoints
        : typeof rawPoints === "object" && rawPoints !== null && "toNumber" in rawPoints && typeof (rawPoints as { toNumber: () => number }).toNumber === "function"
        ? (rawPoints as { toNumber: () => number }).toNumber()
        : Number(rawPoints) || 0;

    if (studentResponse === null || studentResponse === undefined) {
      return {
        isCorrect: false,
        awardedPoints: 0,
        gradingStatus: "AUTO_GRADED",
      };
    }

    const options = question.options || [];

    switch (question.type) {
      case "MCQ":
        return gradeMcq(studentResponse, options, maxPoints, question.configuration);

      case "TRUE_FALSE":
        return gradeTrueFalse(studentResponse, options, maxPoints, question.configuration);

      case "NUMERIC":
        return gradeNumeric(studentResponse, question.configuration, maxPoints);

      case "SHORT_ANSWER":
        return gradeShortAnswer(studentResponse, options, question.configuration, maxPoints);

      case "LONG_ANSWER":
      case "MATCHING":
      case "ORDERING":
      default:
        return gradeManualPending();
    }
  }
}

