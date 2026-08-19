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

  const currentMembership =
    memberships.find((m) => m.tenantId === activeTenantId) || memberships[0];

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    emailVerified: user.emailVerified,
    roles: currentMembership?.roles || [],
    tenantId: currentMembership?.tenantId,
    memberships,
    currentTenantId: currentMembership?.tenantId,
  };
};
