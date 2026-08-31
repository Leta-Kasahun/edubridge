import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const sectionRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/academic/sections",
    method: "GET",
    summary: "List Sections",
    description: "Retrieve class sections with grade level, capacity, enrollment counts, and assigned homeroom teacher.",
    tags: ["Academic - Sections"],
    security: true,
    parameters: [
      { name: "academicYearId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "gradeId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "ARCHIVED", "ALL"] } },
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "page", in: "query", schema: { type: "integer" } },
      { name: "limit", in: "query", schema: { type: "integer" } },
    ],
    responses: {
      200: { description: "Sections list retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/sections/{id}",
    method: "GET",
    summary: "Get Section by ID",
    description: "Retrieve single section details, capacity utilization, and student list.",
    tags: ["Academic - Sections"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Section retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Section not found" },
    },
  },
  {
    path: "/api/academic/sections",
    method: "POST",
    summary: "Create Section",
    description: "Create a single class section within an academic year and grade level.",
    tags: ["Academic - Sections"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          academicYearId: { type: "string", format: "uuid" },
          gradeId: { type: "string", format: "uuid" },
          capacity: { type: "integer" },
          homeroomTeacherId: { type: "string", format: "uuid" },
        },
        required: ["name", "academicYearId", "gradeId"],
      },
    },
    responses: {
      201: { description: "Section created successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/sections/bulk",
    method: "POST",
    summary: "Bulk Generate Sections",
    description: "Generate multiple sections (e.g., A, B, C) across grade levels in one operation.",
    tags: ["Academic - Sections"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          academicYearId: { type: "string", format: "uuid" },
          gradeIds: { type: "array", items: { type: "string", format: "uuid" } },
          sectionCountPerGrade: { type: "integer" },
          namingFormat: { type: "string", enum: ["LETTER", "NUMBER"] },
          defaultCapacity: { type: "integer" },
        },
        required: ["academicYearId", "gradeIds", "sectionCountPerGrade"],
      },
    },
    responses: {
      201: { description: "Sections generated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/sections/{id}",
    method: "PATCH",
    summary: "Update Section",
    description: "Update section name, capacity, or assigned homeroom teacher.",
    tags: ["Academic - Sections"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          capacity: { type: "integer" },
          homeroomTeacherId: { type: "string", format: "uuid" },
        },
      },
    },
    responses: {
      200: { description: "Section updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Section not found" },
    },
  },
  {
    path: "/api/academic/sections/{id}/status",
    method: "PATCH",
    summary: "Update Section Status",
    description: "Update section status (ACTIVE, INACTIVE, ARCHIVED).",
    tags: ["Academic - Sections"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ACTIVE", "INACTIVE", "ARCHIVED"] },
        },
        required: ["status"],
      },
    },
    responses: {
      200: { description: "Section status updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Section not found" },
    },
  },
  {
    path: "/api/academic/sections/{id}",
    method: "DELETE",
    summary: "Delete Section",
    description: "Delete an empty section without active student enrollments.",
    tags: ["Academic - Sections"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Section deleted successfully" },
      400: { description: "Section contains active enrollments" },
      401: { description: "Unauthorized" },
      404: { description: "Section not found" },
    },
  },
];

export const registerSectionDocs = (): void => {
  for (const definition of sectionRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
