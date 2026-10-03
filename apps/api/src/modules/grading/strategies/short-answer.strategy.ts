import type { QuestionOption } from "../../../generated/prisma/client.js";
import { GradingResult } from "./mcq.strategy.js";

export function gradeShortAnswer(
  studentResponse: unknown,
  options: QuestionOption[] | undefined,
  configuration: unknown,
  maxPoints: number
): GradingResult {
  if (studentResponse === null || studentResponse === undefined) {
    return {
      isCorrect: false,
      awardedPoints: 0,
      gradingStatus: "AUTO_GRADED",
    };
  }

  let responseText: string;
  if (typeof studentResponse === "string") {
    responseText = studentResponse.trim();
  } else if (
    studentResponse &&
    typeof studentResponse === "object" &&
    "answer" in studentResponse &&
    typeof (studentResponse as { answer: unknown }).answer === "string"
  ) {
    responseText = (studentResponse as { answer: string }).answer.trim();
  } else if (
    studentResponse &&
    typeof studentResponse === "object" &&
    "value" in studentResponse
  ) {
    responseText = String((studentResponse as { value: unknown }).value).trim();
  } else {
    responseText = String(studentResponse).trim();
  }

  if (!responseText) {
    return {
      isCorrect: false,
      awardedPoints: 0,
      gradingStatus: "AUTO_GRADED",
    };
  }

  const normalizedResponse = responseText.toLowerCase();

  // 1. Check options with isCorrect = true
  if (Array.isArray(options) && options.length > 0) {
    const correctOptions = options.filter((opt) => opt.isCorrect);
    for (const opt of correctOptions) {
      if (
        opt.optionText.trim().toLowerCase() === normalizedResponse ||
        opt.optionKey.trim().toLowerCase() === normalizedResponse
      ) {
        return {
          isCorrect: true,
          awardedPoints: maxPoints,
          gradingStatus: "AUTO_GRADED",
        };
      }
    }
  }

  // 2. Check configuration for acceptable answers or correctAnswer
  if (configuration && typeof configuration === "object") {
    const config = configuration as Record<string, unknown>;
    const acceptableList: string[] = [];

    if (Array.isArray(config.acceptableAnswers)) {
      for (const item of config.acceptableAnswers) {
        if (typeof item === "string" && item.trim()) {
          acceptableList.push(item.trim().toLowerCase());
        }
      }
    }

    if (typeof config.correctAnswer === "string" && config.correctAnswer.trim()) {
      acceptableList.push(config.correctAnswer.trim().toLowerCase());
    }

    if (typeof config.answer === "string" && config.answer.trim()) {
      acceptableList.push(config.answer.trim().toLowerCase());
    }

    if (Array.isArray(config.options)) {
      for (const opt of config.options as Array<Record<string, unknown>>) {
        if (opt.isCorrect) {
          if (typeof opt.optionText === "string") acceptableList.push(opt.optionText.trim().toLowerCase());
          if (typeof opt.text === "string") acceptableList.push(opt.text.trim().toLowerCase());
          if (typeof opt.label === "string") acceptableList.push(opt.label.trim().toLowerCase());
        }
      }
    }

    if (acceptableList.length > 0) {
      const isMatch = acceptableList.some((target) => target === normalizedResponse);
      return {
        isCorrect: isMatch,
        awardedPoints: isMatch ? maxPoints : 0,
        gradingStatus: "AUTO_GRADED",
      };
    }
  }

  // 3. Fallback to manual teacher review if no automated answer key was configured
  return {
    isCorrect: null,
    awardedPoints: 0,
    gradingStatus: "MANUAL_GRADING",
  };
}
