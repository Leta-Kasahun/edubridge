import { z } from "zod";

export const provisionSchoolAdminInviteSchema = z.object({
  tenantName: z.string().trim().min(1, "School/Tenant name is required").max(255),
  tenantId: z.string().uuid("Valid Tenant ID").optional(),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().min(1, "Email is required").max(255).email("Invalid email address").toLowerCase(),
});

export const provisionSchoolAdminDirectSchema = z.object({
  tenantName: z.string().trim().min(1, "School/Tenant name is required").max(255),
  tenantId: z.string().uuid("Valid Tenant ID").optional(),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().max(255).email("Invalid email address").toLowerCase().optional().or(z.literal("")),
});

export const provisionSchoolAdminSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("INVITATION"),
    tenantName: z.string().trim().min(1, "School/Tenant name is required").max(255),
    tenantId: z.string().uuid("Valid Tenant ID").optional(),
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    email: z.string().trim().min(1, "Email is required").max(255).email("Invalid email address").toLowerCase(),
  }),
  z.object({
    method: z.literal("DIRECT_CREDENTIALS"),
    tenantName: z.string().trim().min(1, "School/Tenant name is required").max(255),
    tenantId: z.string().uuid("Valid Tenant ID").optional(),
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    email: z.string().trim().max(255).email("Invalid email address").toLowerCase().optional().or(z.literal("")),
  }),
]);

export const regenerateCredentialsSchema = z.object({
  userId: z.string().uuid("Valid User ID is required"),
});

export type ProvisionSchoolAdminInviteDto = z.infer<typeof provisionSchoolAdminInviteSchema>;
export type ProvisionSchoolAdminDirectDto = z.infer<typeof provisionSchoolAdminDirectSchema>;
export type ProvisionSchoolAdminDto = z.infer<typeof provisionSchoolAdminSchema>;
export type RegenerateCredentialsDto = z.infer<typeof regenerateCredentialsSchema>;
