import { MasteryLevelEnum } from "../constants/assessment.constants.js";

export interface MasteryThresholds {
  developingMax: number;
  proficientMax: number;
  minEvidenceCount: number;
}

export const DEFAULT_MASTERY_THRESHOLDS: MasteryThresholds = {
  developingMax: 49.99,
  proficientMax: 79.99,
  minEvidenceCount: 3,
};

export function computeMasteryLevel(
  accuracy: number | null | undefined,
  evidenceCount: number,
  thresholds: MasteryThresholds = DEFAULT_MASTERY_THRESHOLDS
): MasteryLevelEnum {
  if (evidenceCount === 0 || accuracy === null || accuracy === undefined) {
    return "NOT_STARTED";
  }

  if (evidenceCount < thresholds.minEvidenceCount) {
    return "DEVELOPING";
  }

  if (accuracy <= thresholds.developingMax) {
    return "DEVELOPING";
  }

  if (accuracy <= thresholds.proficientMax) {
    return "PROFICIENT";
  }

  return "MASTERED";
}
