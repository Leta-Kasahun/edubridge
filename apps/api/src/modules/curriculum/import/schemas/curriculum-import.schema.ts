import { z } from "zod";
import { CURRICULUM_CODE_REGEX } from "../../../../shared/constants/curriculum.constants.js";

export const parsedCurriculumRowSchema = z.object({
  gradeLevel: z.coerce.number().int().min(1).max(12),
  subjectCode: z.string().min(1).max(50),
  unitCode: z.string().min(1).max(50).regex(CURRICULUM_CODE_REGEX),
  unitTitle: z.string().min(1).max(255),
  topicCode: z.string().min(1).max(50).regex(CURRICULUM_CODE_REGEX),
  topicTitle: z.string().min(1).max(255),
  objectiveCode: z.string().min(1).max(50).regex(CURRICULUM_CODE_REGEX),
  objectiveStatement: z.string().min(3).max(1000),
  externalId: z.string().max(100).optional().nullable(),
});

export const curriculumImportCommitSchema = z.object({
  curriculumVersionId: z.string().uuid("Invalid curriculum version ID"),
  rows: z.array(parsedCurriculumRowSchema).min(1, "At least one row is required for commit"),
});
