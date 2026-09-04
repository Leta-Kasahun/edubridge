import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";
import { CONTENT_TYPES, CONTENT_SCOPES } from "../../../shared/constants/index.js";

const contentRouteDefinitions: readonly RouteDefinition[] = [
  {
    path: "/api/learning-content/content",
    method: "GET",
    summary: "List Learning Content",
    description: "Retrieve paginated learning content filtered by scope, grade, subject, unit, topic, objective, type, or status.",
    tags: ["Learning Content - Materials"],
    security: true,
    parameters: [
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "type", in: "query", schema: { type: "string", enum: [...CONTENT_TYPES] } },
      { name: "scope", in: "query", schema: { type: "string", enum: [...CONTENT_SCOPES] } },
      { name: "status", in: "query", schema: { type: "string", enum: ["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"] } },
      { name: "source", in: "query", schema: { type: "string", enum: ["TEACHER", "SYSTEM", "AI"] } },
      { name: "subjectId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "gradeId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "targetGradeLevel", in: "query", schema: { type: "integer" } },
      { name: "unitId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "topicId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "objectiveId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "curriculumVersionId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "academicYearId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
    ],
    responses: {
      200: { description: "Learning content retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/learning-content/content/{id}",
    method: "GET",
    summary: "Get Learning Content Detail",
    description: "Retrieve complete content details with current version, mapped objectives, and attachments.",
    tags: ["Learning Content - Materials"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Learning content retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Learning content not found" },
    },
  },
  {
    path: "/api/learning-content/content",
    method: "POST",
    summary: "Create Learning Content Draft",
    description: "Create a new learning content item with initial auto-generated Version 1 and scope-based curriculum mappings.",
    tags: ["Learning Content - Materials"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          type: { type: "string", enum: [...CONTENT_TYPES] },
          scope: { type: "string", enum: [...CONTENT_SCOPES], default: "TOPIC" },
          source: { type: "string", enum: ["TEACHER", "SYSTEM", "AI"] },
          subjectId: { type: "string", format: "uuid" },
          gradeId: { type: "string", format: "uuid" },
          targetGradeLevels: { type: "array", items: { type: "integer" } },
          unitId: { type: "string", format: "uuid" },
          curriculumVersionId: { type: "string", format: "uuid" },
          primaryTopicId: { type: "string", format: "uuid" },
          secondaryTopicIds: { type: "array", items: { type: "string", format: "uuid" } },
          objectiveIds: { type: "array", items: { type: "string", format: "uuid" } },
          initialVersionBody: { type: "object" },
          changeNote: { type: "string" },
        },
        required: ["title", "type"],
      },
    },
    responses: {
      201: { description: "Learning content created successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/learning-content/content/{id}",
    method: "PATCH",
    summary: "Update Content Metadata",
    description: "Update basic content properties and hierarchy alignment without changing versions.",
    tags: ["Learning Content - Materials"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          type: { type: "string", enum: [...CONTENT_TYPES] },
          scope: { type: "string", enum: [...CONTENT_SCOPES] },
          source: { type: "string", enum: ["TEACHER", "SYSTEM", "AI"] },
          subjectId: { type: "string", format: "uuid" },
          gradeId: { type: "string", format: "uuid" },
          targetGradeLevels: { type: "array", items: { type: "integer" } },
          unitId: { type: "string", format: "uuid" },
          curriculumVersionId: { type: "string", format: "uuid" },
        },
      },
    },
    responses: {
      200: { description: "Metadata updated successfully" },
      400: { description: "Validation error" },
      404: { description: "Content not found" },
    },
  },
  {
    path: "/api/learning-content/content/{id}/mappings",
    method: "PUT",
    summary: "Update Curriculum Mappings",
    description: "Update associated scope, curriculum hierarchy, topics, and learning objectives.",
    tags: ["Learning Content - Materials"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          scope: { type: "string", enum: [...CONTENT_SCOPES] },
          subjectId: { type: "string", format: "uuid" },
          gradeId: { type: "string", format: "uuid" },
          unitId: { type: "string", format: "uuid" },
          curriculumVersionId: { type: "string", format: "uuid" },
          primaryTopicId: { type: "string", format: "uuid" },
          secondaryTopicIds: { type: "array", items: { type: "string", format: "uuid" } },
          objectiveIds: { type: "array", items: { type: "string", format: "uuid" } },
        },
      },
    },
    responses: {
      200: { description: "Mappings updated successfully" },
      400: { description: "Validation error" },
      404: { description: "Content not found" },
    },
  },
  {
    path: "/api/learning-content/content/{id}/versions",
    method: "POST",
    summary: "Save New Content Version",
    description: "Save a new version revision (automatically increments version number).",
    tags: ["Learning Content - Versions"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          body: { type: "object" },
          changeNote: { type: "string" },
        },
        required: ["body"],
      },
    },
    responses: {
      201: { description: "New version created successfully" },
      400: { description: "Validation error" },
      404: { description: "Content not found" },
    },
  },
  {
    path: "/api/learning-content/content/{id}/versions",
    method: "GET",
    summary: "List Version History",
    description: "List all historical revisions with snapshotted attachments.",
    tags: ["Learning Content - Versions"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Version history retrieved successfully" },
      404: { description: "Content not found" },
    },
  },
  {
    path: "/api/learning-content/content/{id}/versions/{versionNumber}",
    method: "GET",
    summary: "Get Specific Historical Version",
    description: "Retrieve complete body and snapshotted attachments for a specific version number.",
    tags: ["Learning Content - Versions"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "versionNumber", in: "path", required: true, schema: { type: "integer" } },
    ],
    responses: {
      200: { description: "Historical version retrieved successfully" },
      404: { description: "Version not found" },
    },
  },
  {
    path: "/api/learning-content/content/{id}/submit",
    method: "POST",
    summary: "Submit Content for Review",
    description: "Transition content state from DRAFT to PENDING_REVIEW.",
    tags: ["Learning Content - Lifecycle"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Content submitted for review" },
      400: { description: "Invalid state transition" },
    },
  },
  {
    path: "/api/learning-content/content/{id}/publish",
    method: "POST",
    summary: "Publish Content",
    description: "Approve and publish learning content for student and teacher access.",
    tags: ["Learning Content - Lifecycle"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Content published successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/learning-content/content/{id}/archive",
    method: "POST",
    summary: "Archive Content",
    description: "Archive published content from active curriculum views.",
    tags: ["Learning Content - Lifecycle"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Content archived successfully" },
    },
  },
  {
    path: "/api/learning-content/content/{id}/attachments",
    method: "POST",
    summary: "Upload File Attachment",
    description: "Upload a document, PDF, video, audio, or image attachment.",
    tags: ["Learning Content - Attachments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      201: { description: "Attachment uploaded successfully" },
      400: { description: "Invalid file or size limit exceeded" },
    },
  },
  {
    path: "/api/learning-content/content/{id}/attachments/{attachmentId}",
    method: "DELETE",
    summary: "Delete Attachment",
    description: "Delete an attachment unless referenced in a published historical version.",
    tags: ["Learning Content - Attachments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "attachmentId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Attachment deleted successfully" },
      400: { description: "Attachment is locked in published version" },
    },
  },
];

export function registerContentDocs(): void {
  contentRouteDefinitions.forEach((definition) => {
    routeRegistry.register(definition);
  });
}
