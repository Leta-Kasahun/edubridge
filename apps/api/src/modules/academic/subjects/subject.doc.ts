import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const subjectRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/academic/subjects",
    method: "GET",
    summary: "List Subjects",
    description: "Retrieve curriculum subjects with credit hours, category, and assigned grade levels.",
    tags: ["Academic - Subjects"],
    security: true,
    parameters: [
      { name: "gradeLevel", in: "query", schema: { type: "integer" } },
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "category", in: "query", schema: { type: "string" } },
    ],
    responses: {
      200: { description: "Subjects retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/subjects/{id}",
    method: "GET",
    summary: "Get Subject by ID",
    description: "Retrieve single subject configuration and grade associations.",
    tags: ["Academic - Subjects"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Subject retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Subject not found" },
    },
  },
  {
    path: "/api/academic/subjects",
    method: "POST",
    summary: "Create Subject",
    description: "Define a curriculum subject with code, department, and grade levels.",
    tags: ["Academic - Subjects"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          code: { type: "string" },
          category: { type: "string" },
          creditHours: { type: "number" },
          gradeIds: { type: "array", items: { type: "string", format: "uuid" } },
        },
        required: ["name", "code"],
      },
    },
    responses: {
      201: { description: "Subject created successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/subjects/{id}",
    method: "PUT",
    summary: "Update Subject",
    description: "Update curriculum subject metadata or grade level associations.",
    tags: ["Academic - Subjects"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          code: { type: "string" },
          category: { type: "string" },
          creditHours: { type: "number" },
          gradeIds: { type: "array", items: { type: "string", format: "uuid" } },
        },
      },
    },
    responses: {
      200: { description: "Subject updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Subject not found" },
    },
  },
  {
    path: "/api/academic/subjects/{id}/toggle-status",
    method: "POST",
    summary: "Toggle Subject Status",
    description: "Activate or deactivate a curriculum subject.",
    tags: ["Academic - Subjects"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Subject status updated successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Subject not found" },
    },
  },
  {
    path: "/api/academic/subjects/{id}/assign-grades",
    method: "POST",
    summary: "Assign Subject to Grades",
    description: "Assign or replace grade level mapping for a subject.",
    tags: ["Academic - Subjects"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          gradeIds: { type: "array", items: { type: "string", format: "uuid" } },
        },
        required: ["gradeIds"],
      },
    },
    responses: {
      200: { description: "Grades assigned successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Subject not found" },
    },
  },
];

export const registerSubjectDocs = (): void => {
  for (const definition of subjectRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
