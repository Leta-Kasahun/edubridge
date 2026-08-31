import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const gradeRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/academic/grades",
    method: "GET",
    summary: "List Grade Levels",
    description: "Retrieve all defined grade levels and curriculum stages in ascending order.",
    tags: ["Academic - Grades"],
    security: true,
    responses: {
      200: { description: "Grade levels retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/grades/{id}",
    method: "GET",
    summary: "Get Grade Level by ID",
    description: "Retrieve details and curriculum structure for a specific grade level.",
    tags: ["Academic - Grades"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Grade level retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Grade level not found" },
    },
  },
  {
    path: "/api/academic/grades",
    method: "POST",
    summary: "Create Grade Level",
    description: "Define a new grade level with numeric ranking and name.",
    tags: ["Academic - Grades"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          level: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
        },
        required: ["level", "name"],
      },
    },
    responses: {
      201: { description: "Grade level created successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/grades/{id}/toggle-status",
    method: "PATCH",
    summary: "Toggle Grade Active Status",
    description: "Activate or deactivate a grade level.",
    tags: ["Academic - Grades"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Grade status toggled successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Grade level not found" },
    },
  },
];

export const registerGradeDocs = (): void => {
  for (const definition of gradeRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
