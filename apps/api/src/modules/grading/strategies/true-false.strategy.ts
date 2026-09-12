import type { QuestionOption } from "../../../generated/prisma/client.js";
import { GradingResult } from "./mcq.strategy.js";

export function gradeTrueFalse(
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

  const correctKey = correctOption.optionKey.toLowerCase();
  const correctText = correctOption.optionText.trim().toLowerCase();

  const isCorrect =
    selectedValue === correctKey ||
    selectedValue === correctText ||
    (selectedValue === "true" && (correctKey === "a" || correctText === "true")) ||
    (selectedValue === "false" && (correctKey === "b" || correctText === "false"));

  return {
    isCorrect,
    awardedPoints: isCorrect ? maxPoints : 0,
    gradingStatus: "AUTO_GRADED",
  };
}
