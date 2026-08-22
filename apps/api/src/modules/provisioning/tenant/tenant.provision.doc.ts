import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const tenantProvisioningRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/provisioning/tenant/invite",
    method: "POST",
    summary: "Invite School Admin",
    description: "Provision a School Administrator account and dispatch an email invitation with temporary credentials and a single-use 48-hour OTP code.",
    tags: ["Provisioning - Tenant"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          tenantName: {
            type: "string",
            description: "School/Tenant name",
            example: "Apex Academy",
          },
          tenantId: {
            type: "string",
            format: "uuid",
            description: "Optional tenant UUID",
          },
          firstName: {
            type: "string",
            description: "First name of school administrator",
            example: "Abebe",
          },
          lastName: {
            type: "string",
            description: "Last name of school administrator",
            example: "Kebede",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email address for invitation delivery",
            example: "admin@apex.edu.et",
          },
        },
        required: ["tenantName", "firstName", "lastName", "email"],
      },
    },
  },
  {
    path: "/api/provisioning/tenant/direct",
    method: "POST",
    summary: "Create School Admin Directly",
    description: "Provision a School Administrator account and return one-time temporary credentials directly to the system administrator.",
    tags: ["Provisioning - Tenant"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          tenantName: {
            type: "string",
            description: "School/Tenant name",
            example: "Apex Academy",
          },
          tenantId: {
            type: "string",
            format: "uuid",
            description: "Optional tenant UUID",
          },
          firstName: {
            type: "string",
            description: "First name of school administrator",
            example: "Abebe",
          },
          lastName: {
            type: "string",
            description: "Last name of school administrator",
            example: "Kebede",
          },
          email: {
            type: "string",
            format: "email",
            description: "Optional email address",
            example: "admin@apex.edu.et",
          },
        },
        required: ["tenantName", "firstName", "lastName"],
      },
    },
  },
  {
    path: "/api/provisioning/tenant",
    method: "POST",
    summary: "Provision School Admin",
    description: "Unified endpoint to provision a School Administrator account via INVITATION or DIRECT_CREDENTIALS method.",
    tags: ["Provisioning - Tenant"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          method: {
            type: "string",
            enum: ["INVITATION", "DIRECT_CREDENTIALS"],
            description: "Provisioning method",
            example: "INVITATION",
          },
          tenantName: {
            type: "string",
            description: "School/Tenant name",
            example: "Apex Academy",
          },
          tenantId: {
            type: "string",
            format: "uuid",
            description: "Optional tenant UUID",
          },
          firstName: {
            type: "string",
            description: "First name of school administrator",
            example: "Abebe",
          },
          lastName: {
            type: "string",
            description: "Last name of school administrator",
            example: "Kebede",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email address (required for INVITATION)",
            example: "admin@apex.edu.et",
          },
        },
        required: ["method", "tenantName", "firstName", "lastName"],
      },
    },
  },
  {
    path: "/api/provisioning/tenant/regenerate-credentials",
    method: "POST",
    summary: "Regenerate School Admin Credentials",
    description: "Regenerate temporary credentials for a school administrator whose account is pending first login setup.",
    tags: ["Provisioning - Tenant"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            format: "uuid",
            description: "User UUID",
          },
        },
        required: ["userId"],
      },
    },
  },
];

export const registerTenantProvisioningDocs = (): void => {
  for (const definition of tenantProvisioningRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
