import { routeRegistry } from "../../docs/route.registry.js";

export const registerActivityLogDocs = (): void => {
  routeRegistry.registerTag(
    "Activity Log",
    "School System Activity Log & Audit Trail for School and System Administrators"
  );

  routeRegistry.register({
    path: "/activity-logs",
    method: "GET",
    description:
      "List audit trail and activity log entries. Scoped to tenant for School Admins, cross-school for System Admins.",
    tags: ["Activity Log"],
    security: true,
    parameters: [
      {
        name: "page",
        in: "query",
        schema: { type: "integer", default: 1 },
        description: "Page number",
      },
      {
        name: "limit",
        in: "query",
        schema: { type: "integer", default: 20 },
        description: "Items per page (max 100)",
      },
      {
        name: "resource",
        in: "query",
        schema: { type: "string" },
        description: "Filter by resource category (e.g. STUDENT, TEACHER, ENROLLMENT, ACADEMIC, CURRICULUM, ASSESSMENT, ATTENDANCE, AUTH)",
      },
      {
        name: "action",
        in: "query",
        schema: { type: "string" },
        description: "Filter by action (e.g. CREATE, UPDATE, DELETE, LOGIN, ASSIGN)",
      },
      {
        name: "search",
        in: "query",
        schema: { type: "string" },
        description: "Search keyword matching action, resource, or actor user name/email",
      },
      {
        name: "tenantId",
        in: "query",
        schema: { type: "string" },
        description: "Filter by school tenant ID (Allowed for System Admins only)",
      },
    ],
    responses: {
      200: { description: "Paginated list of activity log records" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden - Requires SYSTEM_ADMIN or SCHOOL_ADMIN role" },
    },
  });

  routeRegistry.register({
    path: "/activity-logs/stats",
    method: "GET",
    description: "Get summary metrics and counts for activities",
    tags: ["Activity Log"],
    security: true,
    responses: {
      200: { description: "Activity log statistics" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden" },
    },
  });
};

