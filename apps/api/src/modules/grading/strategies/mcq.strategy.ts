import type { QuestionOption } from "../../../generated/prisma/client.js";

export interface GradingResult {
  isCorrect: boolean | null;
  awardedPoints: number;
  feedback?: string;
  gradingStatus: "AUTO_GRADED" | "MANUAL_GRADING" | "GRADED";
}

export function gradeMcq(
  studentResponse: unknown,
  options: QuestionOption[] | undefined,
  maxPoints: number,
  configuration?: unknown
): GradingResult {
  let allOptions: Array<{
    id?: string;
    optionKey: string;
    optionText: string;
    isCorrect: boolean;
  }> = [];

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
      id: typeof opt.id === "string" ? opt.id : undefined,
      optionKey: typeof opt.optionKey === "string" ? opt.optionKey : typeof opt.key === "string" ? opt.key : String.fromCharCode(65 + idx),
      optionText: typeof opt.optionText === "string" ? opt.optionText : typeof opt.text === "string" ? opt.text : typeof opt.label === "string" ? opt.label : "",
      isCorrect: Boolean(opt.isCorrect),
    }));
  }

  const correctOption = allOptions.find((opt) => opt.isCorrect);

  let selectedVal = "";
  if (typeof studentResponse === "string") {
    selectedVal = studentResponse.trim();
  } else if (
    studentResponse &&
    typeof studentResponse === "object" &&
    "selectedKey" in studentResponse &&
    typeof (studentResponse as { selectedKey: unknown }).selectedKey === "string"
  ) {
    selectedVal = (studentResponse as { selectedKey: string }).selectedKey.trim();
  } else if (
    studentResponse &&
    typeof studentResponse === "object" &&
    "optionId" in studentResponse &&
    typeof (studentResponse as { optionId: unknown }).optionId === "string"
  ) {
    const optId = (studentResponse as { optionId: string }).optionId;
    const selectedOption = allOptions.find((opt) => opt.id === optId);
    selectedVal = selectedOption ? selectedOption.optionKey : optId;
  } else if (
    studentResponse &&
    typeof studentResponse === "object" &&
    "answer" in studentResponse &&
    typeof (studentResponse as { answer: unknown }).answer === "string"
  ) {
    selectedVal = (studentResponse as { answer: string }).answer.trim();
  }

  if (!selectedVal) {
    return {
      isCorrect: false,
      awardedPoints: 0,
      gradingStatus: "AUTO_GRADED",
    };
  }

  if (correctOption) {
    const isKeyMatch = selectedVal.toLowerCase() === correctOption.optionKey.toLowerCase();
    const isIdMatch = Boolean(correctOption.id && selectedVal === correctOption.id);
    const isTextMatch = Boolean(
      correctOption.optionText &&
        selectedVal.toLowerCase() === correctOption.optionText.trim().toLowerCase()
    );

    const isCorrect = Boolean(isKeyMatch || isIdMatch || isTextMatch);

    return {
      isCorrect,
      awardedPoints: isCorrect ? maxPoints : 0,
      gradingStatus: "AUTO_GRADED",
    };
  }

  if (configuration && typeof configuration === "object") {
    const config = configuration as Record<string, unknown>;
    const directCorrect =
      typeof config.correctAnswer === "string"
        ? config.correctAnswer.trim().toLowerCase()
        : typeof config.correctOptionKey === "string"
        ? config.correctOptionKey.trim().toLowerCase()
        : null;

    if (directCorrect) {
      const isCorrect = selectedVal.toLowerCase() === directCorrect;
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
