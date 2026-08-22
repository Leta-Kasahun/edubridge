import { UserWithMembershipsRecord, UserAuthProfile } from "../../modules/auth/types/auth.types.js";

export const mapUserProfile = (
  user: UserWithMembershipsRecord,
  activeTenantId?: string
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

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    emailVerified: user.emailVerified,
    roles: effectiveRoles,
    tenantId: currentMembership?.tenantId,
    memberships,
    currentTenantId: currentMembership?.tenantId,
  };
};
