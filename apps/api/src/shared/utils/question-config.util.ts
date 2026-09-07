import { QuestionTypeEnum } from "../constants/question-bank.constants.js";
export {
  generateQuestionBankCode,
  generateExamContextCode,
  generateAssessmentCode,
} from "./generators.js";

export interface QuestionOptionInput {
  optionKey: string;
  optionText: string;
  orderIndex: number;
  isCorrect: boolean;
}

export interface QuestionValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateQuestionConfig(
  type: QuestionTypeEnum,
  options?: QuestionOptionInput[],
  configuration?: Record<string, unknown> | null
): QuestionValidationResult {
  switch (type) {
    case "MCQ": {
      if (!options || options.length < 2) {
        return {
          isValid: false,
          error: "Multiple choice questions must have at least 2 options.",
        };
      }
      const correctCount = options.filter((o) => o.isCorrect).length;
      if (correctCount < 1) {
        return {
          isValid: false,
          error: "Multiple choice questions must have at least 1 correct option marked.",
        };
      }
      const keys = new Set(options.map((o) => o.optionKey.trim().toUpperCase()));
      if (keys.size !== options.length) {
        return {
          isValid: false,
          error: "Option keys must be unique.",
        };
      }
      return { isValid: true };
    }

    case "TRUE_FALSE": {
      if (!options || options.length !== 2) {
        return {
          isValid: false,
          error: "True/False questions must have exactly 2 options.",
        };
      }
      const correctCount = options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        return {
          isValid: false,
          error: "True/False questions must have exactly 1 correct option.",
        };
      }
      return { isValid: true };
    }

    case "SHORT_ANSWER": {
      return { isValid: true };
    }

    case "NUMERIC": {
      if (
        configuration &&
        configuration.targetValue !== undefined &&
        typeof configuration.targetValue !== "number"
      ) {
        return {
          isValid: false,
          error: "Numeric question targetValue must be a number.",
        };
      }
      return { isValid: true };
    }

    case "LONG_ANSWER":
    case "MATCHING":
    case "ORDERING":
    default:
      return { isValid: true };
  }
}
