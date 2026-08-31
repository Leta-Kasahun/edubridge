import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const academicYearRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/academic/years",
    method: "GET",
    summary: "List Academic Years",
    description: "Retrieve list of academic years for the current institution.",
    tags: ["Academic - Years"],
    security: true,
    parameters: [
      { name: "status", in: "query", schema: { type: "string", enum: ["UPCOMING", "ACTIVE", "ARCHIVED", "ALL"] } },
    ],
    responses: {
      200: { description: "Academic years list retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/years/active",
    method: "GET",
    summary: "Get Active Academic Year",
    description: "Retrieve currently active academic year and terms for the tenant.",
    tags: ["Academic - Years"],
    security: true,
    responses: {
      200: { description: "Active academic year retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "No active academic year found" },
    },
  },
  {
    path: "/api/academic/years/{id}",
    method: "GET",
    summary: "Get Academic Year by ID",
    description: "Retrieve academic year configuration and associated term dates by ID.",
    tags: ["Academic - Years"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Academic year details retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Academic year not found" },
    },
  },
  {
    path: "/api/academic/years",
    method: "POST",
    summary: "Create Academic Year",
    description: "Define a new school session with start/end calendar dates and terms.",
    tags: ["Academic - Years"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          terms: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                startDate: { type: "string", format: "date" },
                endDate: { type: "string", format: "date" },
              },
              required: ["name", "startDate", "endDate"],
            },
          },
        },
        required: ["name", "startDate", "endDate"],
      },
    },
    responses: {
      201: { description: "Academic year created successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/years/{id}",
    method: "PUT",
    summary: "Update Academic Year",
    description: "Update academic year metadata, dates, or term boundaries.",
    tags: ["Academic - Years"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
        },
      },
    },
    responses: {
      200: { description: "Academic year updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Academic year not found" },
    },
  },
  {
    path: "/api/academic/years/{id}/set-active",
    method: "POST",
    summary: "Set Active Academic Year",
    description: "Set specified academic year as active session for the tenant.",
    tags: ["Academic - Years"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Academic year activated successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Academic year not found" },
    },
  },
  {
    path: "/api/academic/years/{id}/archive",
    method: "POST",
    summary: "Archive Academic Year",
    description: "Archive a completed academic year session.",
    tags: ["Academic - Years"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Academic year archived successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Academic year not found" },
    },
  },
  {
    path: "/api/academic/years/{id}/restore",
    method: "POST",
    summary: "Restore Academic Year",
    description: "Restore an archived academic year session to active/upcoming status.",
    tags: ["Academic - Years"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Academic year restored successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Academic year not found" },
    },
  },
];

export const registerAcademicYearDocs = (): void => {
  for (const definition of academicYearRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
