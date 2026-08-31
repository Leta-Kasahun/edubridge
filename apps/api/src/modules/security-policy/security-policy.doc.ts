import { routeRegistry, RouteDefinition } from "../../docs/route.registry.js";

const securityPolicyRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/security-policy",
    method: "GET",
    summary: "Get Tenant Security Policy",
    description: "Retrieve institution security settings including password complexity, lockout thresholds, session timeouts, and MFA policies.",
    tags: ["Security Policy"],
    security: true,
    responses: {
      200: { description: "Security policy retrieved successfully" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden - Insufficient permissions" },
    },
  },
  {
    path: "/api/security-policy",
    method: "PUT",
    summary: "Update Tenant Security Policy",
    description: "Update password rules, MFA requirements, session lifetimes, and brute-force protection thresholds.",
    tags: ["Security Policy"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          mfaRequiredRoles: { type: "array", items: { type: "string" } },
          minPasswordLength: { type: "integer" },
          requireUppercase: { type: "boolean" },
          requireLowercase: { type: "boolean" },
          requireNumbers: { type: "boolean" },
          requireSpecialChars: { type: "boolean" },
          passwordExpiryDays: { type: "integer" },
          maxLoginAttempts: { type: "integer" },
          lockoutDurationMinutes: { type: "integer" },
          sessionTimeoutMinutes: { type: "integer" },
        },
      },
    },
    responses: {
      200: { description: "Security policy updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden - Insufficient permissions" },
    },
  },
];

export const registerSecurityPolicyDocs = (): void => {
  for (const definition of securityPolicyRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
