import { z } from "zod";

const datePreprocess = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return null;
  if (val instanceof Date) return val;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? undefined : d;
}, z.date().nullable().optional());

export const createTeacherExperienceSchema = z
  .object({
    institution: z
      .string()
      .trim()
      .min(2, "Institution name must be at least 2 characters")
      .max(200, "Institution name must not exceed 200 characters"),
    position: z
      .string()
      .trim()
      .max(150, "Position must not exceed 150 characters")
      .nullable()
      .optional(),
    subjectId: z.string().uuid("Invalid subject ID").nullable().optional(),
    startDate: z.preprocess((val) => {
      if (val instanceof Date) return val;
      const d = new Date(val as string);
      return isNaN(d.getTime()) ? undefined : d;
    }, z.date({ error: "Valid start date is required" })),
    endDate: datePreprocess,
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate.getTime() <= data.endDate.getTime();
      }
      return true;
    },
    {
      message: "Start date must be earlier than or equal to end date",
      path: ["startDate"],
    }
  );

export const updateTeacherExperienceSchema = z
  .object({
    institution: z
      .string()
      .trim()
      .min(2, "Institution name must be at least 2 characters")
      .max(200, "Institution name must not exceed 200 characters")
      .optional(),
    position: z
      .string()
      .trim()
      .max(150, "Position must not exceed 150 characters")
      .nullable()
      .optional(),
    subjectId: z.string().uuid("Invalid subject ID").nullable().optional(),
    startDate: z
      .preprocess((val) => {
        if (val === undefined) return undefined;
        if (val instanceof Date) return val;
        const d = new Date(val as string);
        return isNaN(d.getTime()) ? undefined : d;
      }, z.date().optional())
      .optional(),
    endDate: datePreprocess,
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate.getTime() <= data.endDate.getTime();
      }
      return true;
    },
    {
      message: "Start date must be earlier than or equal to end date",
      path: ["startDate"],
    }
  );

export type CreateTeacherExperienceDto = z.infer<
  typeof createTeacherExperienceSchema
>;
export type UpdateTeacherExperienceDto = z.infer<
  typeof updateTeacherExperienceSchema
>;
