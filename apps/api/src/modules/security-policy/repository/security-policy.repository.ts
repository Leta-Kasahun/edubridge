import { prisma } from "../../../lib/prisma.js";
import { UpdateSecurityPolicyInput } from "../types/security-policy.types.js";

export class SecurityPolicyRepository {
  async findByTenantId(tenantId: string) {
    return prisma.securityPolicy.findUnique({
      where: { tenantId },
    });
  }

  async createDefault(tenantId: string) {
    return prisma.securityPolicy.create({
      data: {
        tenantId,
      },
    });
  }

  async upsert(tenantId: string, data: UpdateSecurityPolicyInput) {
    return prisma.securityPolicy.upsert({
      where: { tenantId },
      update: data,
      create: {
        tenantId,
        ...data,
      },
    });
  }
}

export const securityPolicyRepository = new SecurityPolicyRepository();
