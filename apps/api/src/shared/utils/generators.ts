import crypto from "node:crypto";
import { prisma, runWithoutTenant } from "../../lib/prisma.js";
import { getCurrentEthiopianYear } from "./ethiopian-calendar.util.js";

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

export const generateEmployeeCode = (tenantCode: string, sequence: number): string => {
  const seq = String(sequence).padStart(4, "0");
  return `${tenantCode.toUpperCase()}EMP${seq}`;
};

export const generateStudentCode = (tenantCode: string, sequence: number): string => {
  const seq = String(sequence).padStart(4, "0");
  return `${tenantCode.toUpperCase()}STU${seq}`;
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

export const generateStudentTempPassword = (): string => {
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

export const generateCurriculumCode = (
  prefix: string,
  sequence: number,
  ethiopianYear?: number
): string => {
  const cleanPrefix = (prefix.replace(/[^a-zA-Z]/g, "").slice(0, 3) || "CUR").toUpperCase().padEnd(3, "C");
  const ethYear = String(ethiopianYear ?? getCurrentEthiopianYear()).slice(-2);
  const seq = String(sequence % 10 || 1);
  return `${cleanPrefix}${ethYear}${seq}`.slice(0, 6);
};

export const generateCurriculumVersionCode = (versionNumber: number): string => {
  return `V${versionNumber}`;
};

export const generateCurriculumVersionName = (
  versionNumber: number,
  ethiopianYear?: number
): string => {
  const ethYear = ethiopianYear ?? getCurrentEthiopianYear();
  return `Version ${versionNumber} (${ethYear})`;
};

export const getNextCurriculumSequence = async (tenantId: string | null): Promise<number> => {
  return runWithoutTenant(async () => {
    const count = await prisma.curriculum.count({
      where: {
        tenantId: tenantId ?? null,
      },
    });
    return count + 1;
  });
};

export const getCurriculumCodePrefix = async (
  _tenantId: string | null,
  fallbackName?: string
): Promise<string> => {
  if (fallbackName) {
    const letters = fallbackName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
    if (letters.length >= 2) return letters.padEnd(3, "C");
  }
  return "CUR";
};

export const generateUnitCode = (orderIndex: number): string => {
  return `U${orderIndex}`;
};

export const generateTopicCode = (unitCode: string, orderIndex: number): string => {
  const cleanUnit = unitCode.replace(/[^a-zA-Z0-9]/g, "");
  return `${cleanUnit}T${orderIndex}`;
};

export const generateObjectiveCode = (topicCode: string, orderIndex: number): string => {
  const cleanTopic = topicCode.replace(/[^a-zA-Z0-9]/g, "");
  return `${cleanTopic}O${orderIndex}`;
};


