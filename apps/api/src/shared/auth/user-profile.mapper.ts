import { UserWithMembershipsRecord, UserAuthProfile } from "../../modules/auth/types/auth.types.js";

interface ProfileNames {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
}

export const mapUserProfile = (
  user: UserWithMembershipsRecord & {
    teacherProfile?: ProfileNames | null;
    studentProfile?: ProfileNames | null;
  },
  activeTenantId?: string,
  extra?: { photoUrl?: string | null }
): UserAuthProfile => {
  const memberships = user.memberships.map((m) => ({
    tenantId: m.tenantId,
    tenantName: m.tenant.name,
    roles: m.roles.map((r) => r.role.code),
  }));

  const allRoles = Array.from(new Set(memberships.flatMap((m) => m.roles)));
  const isSystemAdmin = allRoles.includes("SYSTEM_ADMIN");

  const systemAdminMembership = memberships.find((m) => m.roles.includes("SYSTEM_ADMIN"));
  const currentMembership =
    (activeTenantId ? memberships.find((m) => m.tenantId === activeTenantId) : null) ??
    systemAdminMembership ??
    memberships[0];

  const effectiveRoles = isSystemAdmin
    ? Array.from(new Set(["SYSTEM_ADMIN", ...(currentMembership?.roles ?? [])]))
    : currentMembership?.roles ?? [];

  const profile = user.teacherProfile || user.studentProfile;
  const firstName = profile?.firstName || user.firstName || "";
  const middleName = profile?.middleName || null;
  const lastName = profile?.lastName || user.lastName || "";
  const photoUrl = extra?.photoUrl || profile?.photoUrl || null;

  const nameParts = [firstName, middleName, lastName].filter(Boolean);
  const fullName =
    nameParts.length > 0
      ? nameParts.join(" ")
      : user.username || user.email?.split("@")[0] || "User";

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName,
    middleName,
    lastName,
    fullName,
    status: user.status,
    emailVerified: user.emailVerified,
    roles: effectiveRoles,
    tenantId: currentMembership?.tenantId,
    tenantName: currentMembership?.tenantName,
    memberships,
    currentTenantId: currentMembership?.tenantId,
    photoUrl,
    avatarUrl: photoUrl,
  };
};
