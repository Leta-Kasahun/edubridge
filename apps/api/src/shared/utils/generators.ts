import crypto from "node:crypto";
import { prisma, runWithoutTenant } from "../../lib/prisma.js";

export const generateTenantCode = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
};

export const generateSchoolAdminUsername = (tenantCode: string, sequence: number): string => {
  const year = String(new Date().getFullYear()).slice(-2);
  const seq = String(sequence).padStart(4, "0");
  return `${tenantCode.toUpperCase()}A${year}${seq}`;
};

export const generateTeacherUsername = (tenantCode: string, sequence: number): string => {
  const year = String(new Date().getFullYear()).slice(-2);
  const seq = String(sequence).padStart(4, "0");
  return `${tenantCode.toUpperCase()}T${year}${seq}`;
};

export const generateStudentUsername = (tenantCode: string, sequence: number): string => {
  const year = String(new Date().getFullYear()).slice(-2);
  const seq = String(sequence).padStart(4, "0");
  return `${tenantCode.toUpperCase()}S${year}${seq}`;
};

export const generateAdminTempPassword = (): string => {
  const digits = String(crypto.randomInt(0, 10000)).padStart(4, "0");
  return `Temp@${digits}`;
};

export const generateTeacherTempPassword = (): string => {
  const digits = String(crypto.randomInt(0, 10000)).padStart(4, "0");
  return `Temp@${digits}`;
};

export const generateStudentPassword = (username: string): string => {
  return `${username.charAt(0).toUpperCase()}${username.slice(1).toLowerCase()}#`;
};

export const generateOtp = (length: number = 6): string => {
  let otp = "";
  let lastDigit = -1;
  while (otp.length < length) {
    const digit = crypto.randomInt(0, 10);
    if (digit !== lastDigit) {
      otp += digit.toString();
      lastDigit = digit;
    }
  }
  return otp;
};

export const getNextSequence = async (tenantCode: string, role: string): Promise<number> => {
  return runWithoutTenant(async () => {
    const normalizedRole = role.toUpperCase();
    const roleCodes = normalizedRole === "ADMIN" ? ["ADMIN", "SCHOOL_ADMIN"] : [normalizedRole];

    const count = await prisma.membershipRole.count({
      where: {
        membership: {
          tenant: {
            code: {
              equals: tenantCode,
              mode: "insensitive",
            },
          },
        },
        role: {
          code: {
            in: roleCodes,
          },
        },
      },
    });

    return count + 1;
  });
};
