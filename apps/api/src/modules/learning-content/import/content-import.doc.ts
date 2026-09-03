import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const contentImportRouteDefinitions: readonly RouteDefinition[] = [
  {
    path: "/api/learning-content/import/template",
    method: "GET",
    summary: "Download Content Import Template",
    description: "Download standardized CSV template for batch learning content ingestion.",
    tags: ["Learning Content - Import"],
    security: true,
    responses: {
      200: { description: "CSV template file stream" },
    },
  },
  {
    path: "/api/learning-content/import/preview",
    method: "POST",
    summary: "Preview and Validate Content Import Batch",
    description: "Parse CSV content and resolve topic and objective codes against tenant curriculum.",
    tags: ["Learning Content - Import"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          csvContent: { type: "string" },
          curriculumVersionId: { type: "string", format: "uuid" },
        },
        required: ["csvContent"],
      },
    },
    responses: {
      200: { description: "Validated preview rows with errors and resolved IDs" },
      400: { description: "Validation error" },
    },
  },
  {
    path: "/api/learning-content/import/commit",
    method: "POST",
    summary: "Commit Content Import Batch",
    description: "Persist validated learning content items and initial Version 1 in a single database transaction.",
    tags: ["Learning Content - Import"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          rows: { type: "array", items: { type: "object" } },
          curriculumVersionId: { type: "string", format: "uuid" },
        },
        required: ["rows"],
      },
    },
    responses: {
      201: { description: "Batch committed successfully" },
      400: { description: "Validation error" },
    },
  },
];

export function registerContentImportDocs(): void {
  contentImportRouteDefinitions.forEach((definition) => {
    routeRegistry.register(definition);
  });
}
