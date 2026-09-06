import { Request } from "express";
import { prisma } from "../../lib/prisma.js";

const NON_EXISTENT_UUID = "00000000-0000-0000-0000-000000000000";

export async function resolveTeacherScopeId(
  req: Request,
  tenantId?: string
): Promise<string | undefined> {
  const roles = req.user?.roles ?? [];
  const isTeacher = roles.includes("TEACHER");
  const isAdmin =
    roles.includes("SCHOOL_ADMIN") ||
    roles.includes("SYSTEM_ADMIN") ||
    roles.includes("ADMIN");

  if (isTeacher && !isAdmin && req.user?.userId) {
    const profile = await prisma.teacherProfile.findFirst({
      where: {
        userId: req.user.userId,
        ...(tenantId ? { tenantId } : {}),
      },
      select: { id: true },
    });

    return profile ? profile.id : NON_EXISTENT_UUID;
  }

  return undefined;
}
