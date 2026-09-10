import type { QuestionOption } from "../../../generated/prisma/client.js";

export interface GradingResult {
  isCorrect: boolean | null;
  awardedPoints: number;
  feedback?: string;
  gradingStatus: "AUTO_GRADED" | "MANUAL_GRADING" | "GRADED";
}

export function gradeMcq(
  studentResponse: unknown,
  options: QuestionOption[],
  maxPoints: number
): GradingResult {
  const correctOption = options.find((opt) => opt.isCorrect);
  if (!correctOption) {
    return {
      isCorrect: false,
      awardedPoints: 0,
      gradingStatus: "AUTO_GRADED",
    };
  }

  let selectedKey = "";
  if (typeof studentResponse === "string") {
    selectedKey = studentResponse.trim();
  } else if (
    studentResponse &&
    typeof studentResponse === "object" &&
    "selectedKey" in studentResponse &&
    typeof (studentResponse as { selectedKey: unknown }).selectedKey === "string"
  ) {
    selectedKey = (studentResponse as { selectedKey: string }).selectedKey.trim();
  } else if (
    studentResponse &&
    typeof studentResponse === "object" &&
    "optionId" in studentResponse &&
    typeof (studentResponse as { optionId: unknown }).optionId === "string"
  ) {
    const selectedOption = options.find(
      (opt) => opt.id === (studentResponse as { optionId: string }).optionId
    );
    selectedKey = selectedOption ? selectedOption.optionKey : "";
  }

  const isCorrect =
    selectedKey.length > 0 &&
    (selectedKey.toLowerCase() === correctOption.optionKey.toLowerCase() ||
      selectedKey === correctOption.id);

  return {
    isCorrect,
    awardedPoints: isCorrect ? maxPoints : 0,
    gradingStatus: "AUTO_GRADED",
  };
}
