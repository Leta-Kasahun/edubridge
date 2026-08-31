import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const teacherProvisioningRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/provisioning/teachers/invite",
    method: "POST",
    summary: "Invite Teacher",
    description: "Provision a Teacher account and dispatch an email invitation with their username and a single-use 48-hour OTP verification code.",
    tags: ["Provisioning - Teacher"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          tenantId: {
            type: "string",
            format: "uuid",
            description: "School/Tenant UUID",
          },
          firstName: {
            type: "string",
            description: "First name",
          },
          middleName: {
            type: "string",
            description: "Father / Middle name",
          },
          lastName: {
            type: "string",
            description: "Grandfather / Last name",
          },
          gender: {
            type: "string",
            enum: ["MALE", "FEMALE"],
          },
          email: {
            type: "string",
            format: "email",
            description: "Email address for invitation delivery",
          },
          phoneNumber: {
            type: "string",
            description: "Optional phone number",
          },
          employeeCode: {
            type: "string",
            description: "Optional custom employee code",
          },
        },
        required: ["firstName", "middleName", "lastName", "gender", "email"],
      },
    },
  },
  {
    path: "/api/provisioning/teachers/direct",
    method: "POST",
    summary: "Create Teacher Directly",
    description: "Provision a Teacher account with auto-generated temporary password and credentials returned immediately for manual handover.",
    tags: ["Provisioning - Teacher"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          tenantId: {
            type: "string",
            format: "uuid",
            description: "School/Tenant UUID",
          },
          firstName: {
            type: "string",
            description: "First name",
          },
          middleName: {
            type: "string",
            description: "Father / Middle name",
          },
          lastName: {
            type: "string",
            description: "Grandfather / Last name",
          },
          gender: {
            type: "string",
            enum: ["MALE", "FEMALE"],
          },
          email: {
            type: "string",
            format: "email",
            description: "Optional email address",
          },
          phoneNumber: {
            type: "string",
            description: "Optional phone number",
          },
          employeeCode: {
            type: "string",
            description: "Optional custom employee code",
          },
        },
        required: ["firstName", "middleName", "lastName", "gender"],
      },
    },
  },
  {
    path: "/api/provisioning/teachers",
    method: "POST",
    summary: "Provision Teacher (Unified)",
    description: "Unified endpoint to provision a Teacher account via INVITATION or DIRECT_CREDENTIALS method.",
    tags: ["Provisioning - Teacher"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          method: {
            type: "string",
            enum: ["INVITATION", "DIRECT_CREDENTIALS"],
            description: "Provisioning method",
          },
          tenantId: {
            type: "string",
            format: "uuid",
            description: "School/Tenant UUID",
          },
          firstName: {
            type: "string",
            description: "First name",
          },
          middleName: {
            type: "string",
            description: "Father / Middle name",
          },
          lastName: {
            type: "string",
            description: "Grandfather / Last name",
          },
          gender: {
            type: "string",
            enum: ["MALE", "FEMALE"],
          },
          email: {
            type: "string",
            format: "email",
            description: "Email address (required for INVITATION)",
          },
          phoneNumber: {
            type: "string",
            description: "Optional phone number",
          },
          employeeCode: {
            type: "string",
            description: "Optional custom employee code",
          },
        },
        required: ["method", "firstName", "middleName", "lastName", "gender"],
      },
    },
  },
  {
    path: "/api/provisioning/teachers/bulk",
    method: "POST",
    summary: "Bulk Onboard Teachers",
    description: "Bulk onboard a batch of teachers from a structured JSON array with automatic sequence allocation and audit tracking.",
    tags: ["Provisioning - Teacher"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          tenantId: {
            type: "string",
            format: "uuid",
            description: "School/Tenant UUID",
          },
          method: {
            type: "string",
            enum: ["INVITATION", "DIRECT_CREDENTIALS"],
            default: "INVITATION",
          },
          teachers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                firstName: { type: "string" },
                middleName: { type: "string" },
                lastName: { type: "string" },
                gender: { type: "string", enum: ["MALE", "FEMALE"] },
                email: { type: "string", format: "email" },
                phoneNumber: { type: "string" },
                employeeCode: { type: "string" },
              },
              required: ["firstName", "middleName", "lastName", "gender"],
            },
          },
          sendNotifications: {
            type: "boolean",
            default: true,
          },
        },
        required: ["teachers"],
      },
    },
  },
  {
    path: "/api/provisioning/teachers/bulk-csv",
    method: "POST",
    summary: "Bulk Onboard Teachers via CSV",
    description: "Bulk onboard teachers by submitting raw CSV text content. Headers are automatically normalized.",
    tags: ["Provisioning - Teacher"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          tenantId: {
            type: "string",
            format: "uuid",
            description: "School/Tenant UUID",
          },
          method: {
            type: "string",
            enum: ["INVITATION", "DIRECT_CREDENTIALS"],
            default: "INVITATION",
          },
          csvContent: {
            type: "string",
            description: "Raw CSV string with headers",
          },
          sendNotifications: {
            type: "boolean",
            default: true,
          },
        },
        required: ["csvContent"],
      },
    },
  },
  {
    path: "/api/provisioning/teachers",
    method: "GET",
    summary: "List Teachers",
    description: "Get a paginated list of teachers for the authenticated school tenant with multi-field search and status filters.",
    tags: ["Provisioning - Teacher"],
    security: true,
    parameters: [
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "TRANSFERRED", "RESIGNED", "SUSPENDED"] } },
      { name: "gender", in: "query", schema: { type: "string", enum: ["MALE", "FEMALE"] } },
    ],
  },
  {
    path: "/api/provisioning/teachers/{id}",
    method: "GET",
    summary: "Get Teacher Details",
    description: "Get detailed teacher profile, user information, and academic assignments by teacher profile ID.",
    tags: ["Provisioning - Teacher"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
  },
  {
    path: "/api/provisioning/teachers/{id}",
    method: "PUT",
    summary: "Update Teacher Profile",
    description: "Update a teacher's personal information, contact details, and status.",
    tags: ["Provisioning - Teacher"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          middleName: { type: "string" },
          lastName: { type: "string" },
          gender: { type: "string", enum: ["MALE", "FEMALE"] },
          dateOfBirth: { type: "string", format: "date-time" },
          phoneNumber: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
    },
  },
  {
    path: "/api/provisioning/teachers/{id}/deactivate",
    method: "PATCH",
    summary: "Deactivate Teacher",
    description: "Soft-deactivate a teacher profile and suspend or deactivate their login account.",
    tags: ["Provisioning - Teacher"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["INACTIVE", "SUSPENDED", "RESIGNED"],
            default: "INACTIVE",
          },
        },
      },
    },
  },
  {
    path: "/api/provisioning/teachers/{id}/activate",
    method: "PATCH",
    summary: "Activate Teacher",
    description: "Reactivate an inactive or suspended teacher profile and restore their active user access.",
    tags: ["Provisioning - Teacher"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
  },
];

export const registerTeacherProvisioningDocs = (): void => {
  for (const definition of teacherProvisioningRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
