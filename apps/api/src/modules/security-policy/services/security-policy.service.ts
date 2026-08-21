import {
  SecurityPolicyRepository,
  securityPolicyRepository,
} from "../repository/security-policy.repository.js";
import { UpdateSecurityPolicyInput } from "../types/security-policy.types.js";

export class SecurityPolicyService {
  constructor(
    private readonly repository: SecurityPolicyRepository = securityPolicyRepository
  ) {}

  async getPolicy(tenantId: string) {
    let policy = await this.repository.findByTenantId(tenantId);
    if (!policy) {
      policy = await this.repository.createDefault(tenantId);
    }
    return policy;
  }

  async updatePolicy(tenantId: string, data: UpdateSecurityPolicyInput) {
    return this.repository.upsert(tenantId, data);
  }
}

export const securityPolicyService = new SecurityPolicyService();
