import {
  HelpCircle,
  CheckSquare,
  AlignLeft,
  FileText,
  Binary,
  GitCompare,
  ArrowUpDown,
  LucideIcon,
} from "lucide-react";

export function formatPoints(points: number | string | null | undefined): string {
  if (points === null || points === undefined) return "1 pt";
  const num = typeof points === "string" ? parseFloat(points) : points;
  if (isNaN(num)) return "1 pt";
  return num === 1 ? "1 pt" : `${num} pts`;
}

export function buildOptionLabel(index: number): string {
  return String.fromCharCode(65 + (index % 26));
}

export function isOptionQuestion(type: string): boolean {
  return type === "MCQ" || type === "TRUE_FALSE";
}

export function formatTimerDisplay(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getQuestionTypeIcon(type: string): LucideIcon {
  switch (type) {
    case "MCQ":
      return CheckSquare;
    case "TRUE_FALSE":
      return Binary;
    case "SHORT_ANSWER":
      return AlignLeft;
    case "LONG_ANSWER":
      return FileText;
    case "NUMERIC":
      return Binary;
    case "MATCHING":
      return GitCompare;
    case "ORDERING":
      return ArrowUpDown;
    default:
      return HelpCircle;
  }
}
