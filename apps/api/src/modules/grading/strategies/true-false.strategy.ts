import type { QuestionOption } from "../../../generated/prisma/client.js";
import { GradingResult } from "./mcq.strategy.js";

interface OptionLike {
  id?: string;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
}

export function gradeTrueFalse(
  studentResponse: unknown,
  options: QuestionOption[] | undefined,
  maxPoints: number,
  configuration?: unknown
): GradingResult {
  let allOptions: OptionLike[] = [];
  if (Array.isArray(options) && options.length > 0) {
    allOptions = options.map((opt) => ({
      id: opt.id,
      optionKey: opt.optionKey,
      optionText: opt.optionText,
      isCorrect: Boolean(opt.isCorrect),
    }));
  } else if (
    configuration &&
    typeof configuration === "object" &&
    Array.isArray((configuration as Record<string, unknown>).options)
  ) {
    const rawConfigOpts = (configuration as Record<string, unknown>).options as Array<Record<string, unknown>>;
    allOptions = rawConfigOpts.map((opt, idx) => ({
      id: typeof opt.id === "string" ? opt.id : String(idx),
      optionKey: typeof opt.optionKey === "string" ? opt.optionKey : typeof opt.key === "string" ? opt.key : idx === 0 ? "A" : "B",
      optionText: typeof opt.optionText === "string" ? opt.optionText : typeof opt.text === "string" ? opt.text : idx === 0 ? "True" : "False",
      isCorrect: Boolean(opt.isCorrect),
    }));
  }

  const correctOption = allOptions.find((opt) => opt.isCorrect);

  let selectedValue = "";
  if (typeof studentResponse === "boolean") {
    selectedValue = studentResponse ? "true" : "false";
  } else if (typeof studentResponse === "string") {
    selectedValue = studentResponse.trim().toLowerCase();
  } else if (
    studentResponse &&
    typeof studentResponse === "object" &&
    "selectedKey" in studentResponse &&
    typeof (studentResponse as { selectedKey: unknown }).selectedKey === "string"
  ) {
    selectedValue = (studentResponse as { selectedKey: string }).selectedKey.trim().toLowerCase();
  } else if (
    studentResponse &&
    typeof studentResponse === "object" &&
    "value" in studentResponse
  ) {
    const rawVal = (studentResponse as { value: unknown }).value;
    if (typeof rawVal === "boolean") {
      selectedValue = rawVal ? "true" : "false";
    } else if (typeof rawVal === "string") {
      selectedValue = rawVal.trim().toLowerCase();
    }
  }

  if (correctOption) {
    const correctKey = correctOption.optionKey.toLowerCase();
    const correctText = correctOption.optionText.trim().toLowerCase();

    const isCorrect =
      selectedValue === correctKey ||
      selectedValue === correctText ||
      (selectedValue === "true" && (correctKey === "a" || correctText === "true" || correctKey === "true")) ||
      (selectedValue === "false" && (correctKey === "b" || correctText === "false" || correctKey === "false"));

    return {
      isCorrect,
      awardedPoints: isCorrect ? maxPoints : 0,
      gradingStatus: "AUTO_GRADED",
    };
  }

  if (configuration && typeof configuration === "object") {
    const config = configuration as Record<string, unknown>;
    const directCorrect =
      typeof config.correctAnswer === "boolean"
        ? (config.correctAnswer ? "true" : "false")
        : typeof config.correctAnswer === "string"
        ? config.correctAnswer.trim().toLowerCase()
        : null;

    if (directCorrect) {
      const isCorrect = selectedValue === directCorrect;
      return {
        isCorrect,
        awardedPoints: isCorrect ? maxPoints : 0,
        gradingStatus: "AUTO_GRADED",
      };
    }
  }

  return {
    isCorrect: false,
    awardedPoints: 0,
    gradingStatus: "AUTO_GRADED",
  };
}
