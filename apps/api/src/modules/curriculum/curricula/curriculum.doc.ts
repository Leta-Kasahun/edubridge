import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const curriculumRouteDefinitions: readonly RouteDefinition[] = [
  {
    path: "/api/curriculum/curricula",
    method: "GET",
    summary: "List Curricula",
    description: "Retrieve paginated curricula matching scope and status filters.",
    tags: ["Curriculum - Management"],
    security: true,
    parameters: [
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "scope", in: "query", schema: { type: "string", enum: ["TENANT", "SYSTEM"] } },
      { name: "status", in: "query", schema: { type: "string", enum: ["DRAFT", "ACTIVE", "ARCHIVED"] } },
      { name: "version", in: "query", schema: { type: "string" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
    ],
    responses: {
      200: { description: "Curricula retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/curriculum/curricula/{id}",
    method: "GET",
    summary: "Get Curriculum Details",
    description: "Retrieve complete curriculum record with all versions.",
    tags: ["Curriculum - Management"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Curriculum retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Curriculum not found" },
    },
  },
  {
    path: "/api/curriculum/curricula",
    method: "POST",
    summary: "Create Curriculum",
    description: "Create a new curriculum package and initial version.",
    tags: ["Curriculum - Management"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          code: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          scope: { type: "string", enum: ["TENANT", "SYSTEM"] },
          authorityName: { type: "string" },
          externalId: { type: "string" },
          initialVersionCode: { type: "string" },
          initialVersionName: { type: "string" },
        },
        required: ["name"],
      },
    },
    responses: {
      201: { description: "Curriculum created successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      409: { description: "Curriculum code already exists" },
    },
  },
  {
    path: "/api/curriculum/curricula/{id}",
    method: "PUT",
    summary: "Update Curriculum",
    description: "Update curriculum metadata.",
    tags: ["Curriculum - Management"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          authorityName: { type: "string" },
          externalId: { type: "string" },
        },
      },
    },
    responses: {
      200: { description: "Curriculum updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Curriculum not found" },
    },
  },
  {
    path: "/api/curriculum/curricula/{id}/status",
    method: "PATCH",
    summary: "Change Curriculum Status",
    description: "Update status to DRAFT, ACTIVE, or ARCHIVED.",
    tags: ["Curriculum - Management"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["DRAFT", "ACTIVE", "ARCHIVED"] },
        },
        required: ["status"],
      },
    },
    responses: {
      200: { description: "Curriculum status updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Curriculum not found" },
    },
  },
  {
    path: "/api/curriculum/curricula/{id}/versions",
    method: "POST",
    summary: "Create Curriculum Version",
    description: "Create a new version under an existing curriculum.",
    tags: ["Curriculum - Management"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          code: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          effectiveFrom: { type: "string", format: "date" },
          effectiveTo: { type: "string", format: "date" },
          externalId: { type: "string" },
        },
      },
    },
    responses: {
      201: { description: "Curriculum version created successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      409: { description: "Version code already exists" },
    },
  },
  {
    path: "/api/curriculum/curricula/{id}/versions/{versionId}",
    method: "PUT",
    summary: "Update Curriculum Version",
    description: "Update version details.",
    tags: ["Curriculum - Management"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "versionId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          effectiveFrom: { type: "string", format: "date" },
          effectiveTo: { type: "string", format: "date" },
          externalId: { type: "string" },
        },
      },
    },
    responses: {
      200: { description: "Curriculum version updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Curriculum version not found" },
    },
  },
  {
    path: "/api/curriculum/curricula/{id}/versions/{versionId}/status",
    method: "PATCH",
    summary: "Change Curriculum Version Status",
    description: "Set version status to DRAFT, ACTIVE, or ARCHIVED.",
    tags: ["Curriculum - Management"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "versionId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["DRAFT", "ACTIVE", "ARCHIVED"] },
        },
        required: ["status"],
      },
    },
    responses: {
      200: { description: "Version status updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Curriculum version not found" },
    },
  },
];

export const registerCurriculumDocs = (): void => {
  for (const definition of curriculumRouteDefinitions) {
    routeRegistry.register(definition as RouteDefinition);
  }
};
