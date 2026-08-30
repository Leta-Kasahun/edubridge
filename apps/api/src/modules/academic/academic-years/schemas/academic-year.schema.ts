import { z } from "zod";
import { ACADEMIC_YEAR_STATUSES } from "../../../../shared/constants/academic.constants.js";

const academicYearStatusEnum = z.enum(ACADEMIC_YEAR_STATUSES);

export const createAcademicYearSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
    code: z
      .string()
      .min(2, "Code must be at least 2 characters")
      .max(50, "Code cannot exceed 50 characters")
      .trim()
      .toUpperCase(),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    status: academicYearStatusEnum.optional().default("UPCOMING"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end;
    },
    {
      message: "End date must be chronologically after start date",
      path: ["endDate"],
    }
  );

export const updateAcademicYearSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim()
      .optional(),
    code: z
      .string()
      .min(2, "Code must be at least 2 characters")
      .max(50, "Code cannot exceed 50 characters")
      .trim()
      .toUpperCase()
      .optional(),
    startDate: z.string().or(z.date()).optional(),
    endDate: z.string().or(z.date()).optional(),
    status: academicYearStatusEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end;
      }
      return true;
    },
    {
      message: "End date must be chronologically after start date",
      path: ["endDate"],
    }
  );

export type CreateAcademicYearDto = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearDto = z.infer<typeof updateAcademicYearSchema>;
