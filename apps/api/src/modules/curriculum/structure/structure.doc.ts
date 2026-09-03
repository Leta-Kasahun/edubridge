import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const structureRouteDefinitions: readonly RouteDefinition[] = [
  {
    path: "/api/curriculum/structure/versions/{versionId}/subjects",
    method: "GET",
    summary: "List Curriculum Subjects",
    description: "Retrieve all subjects configured for a specific curriculum version.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "versionId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Curriculum subjects retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Curriculum version not found" },
    },
  },
  {
    path: "/api/curriculum/structure/subjects",
    method: "POST",
    summary: "Add Curriculum Subject",
    description: "Associate a grade and subject with a curriculum version.",
    tags: ["Curriculum - Structure"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        required: ["curriculumVersionId", "gradeId", "subjectId"],
        properties: {
          curriculumVersionId: { type: "string", format: "uuid" },
          gradeId: { type: "string", format: "uuid" },
          subjectId: { type: "string", format: "uuid" },
          externalId: { type: "string" },
        },
      },
    },
    responses: {
      201: { description: "Curriculum subject created successfully" },
      400: { description: "Validation error or version archived" },
      409: { description: "Subject already configured for this grade and version" },
    },
  },
  {
    path: "/api/curriculum/structure/subjects/{subjectId}",
    method: "DELETE",
    summary: "Remove Curriculum Subject",
    description: "Remove a curriculum subject association and all nested units.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "subjectId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Curriculum subject removed successfully" },
      404: { description: "Curriculum subject not found" },
    },
  },
  {
    path: "/api/curriculum/structure/subjects/{subjectId}/units",
    method: "GET",
    summary: "List Units by Subject",
    description: "Retrieve paginated units belonging to a curriculum subject.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "subjectId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
    ],
    responses: {
      200: { description: "Units retrieved successfully" },
      404: { description: "Curriculum subject not found" },
    },
  },
  {
    path: "/api/curriculum/structure/units/{unitId}",
    method: "GET",
    summary: "Get Unit by ID",
    description: "Retrieve a specific unit record.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "unitId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Unit retrieved successfully" },
      404: { description: "Unit not found" },
    },
  },
  {
    path: "/api/curriculum/structure/units",
    method: "POST",
    summary: "Create Curriculum Unit",
    description: "Create a new curriculum unit. Code is auto-generated if omitted.",
    tags: ["Curriculum - Structure"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        required: ["curriculumSubjectId", "title"],
        properties: {
          curriculumSubjectId: { type: "string", format: "uuid" },
          code: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          orderIndex: { type: "integer" },
          externalId: { type: "string" },
        },
      },
    },
    responses: {
      201: { description: "Unit created successfully" },
      400: { description: "Validation error or version archived" },
      409: { description: "Unit code already exists in this subject" },
    },
  },
  {
    path: "/api/curriculum/structure/units/{unitId}",
    method: "PUT",
    summary: "Update Curriculum Unit",
    description: "Update title, description, or external ID of a unit.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "unitId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          externalId: { type: "string" },
        },
      },
    },
    responses: {
      200: { description: "Unit updated successfully" },
      404: { description: "Unit not found" },
    },
  },
  {
    path: "/api/curriculum/structure/units/{unitId}",
    method: "DELETE",
    summary: "Delete Curriculum Unit",
    description: "Delete a curriculum unit and nested topics.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "unitId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Unit deleted successfully" },
      404: { description: "Unit not found" },
    },
  },
  {
    path: "/api/curriculum/structure/units/{unitId}/topics",
    method: "GET",
    summary: "List Topics by Unit",
    description: "Retrieve paginated topics belonging to a unit.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "unitId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
    ],
    responses: {
      200: { description: "Topics retrieved successfully" },
      404: { description: "Unit not found" },
    },
  },
  {
    path: "/api/curriculum/structure/topics/{topicId}",
    method: "GET",
    summary: "Get Topic by ID",
    description: "Retrieve a specific topic record.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "topicId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Topic retrieved successfully" },
      404: { description: "Topic not found" },
    },
  },
  {
    path: "/api/curriculum/structure/topics",
    method: "POST",
    summary: "Create Curriculum Topic",
    description: "Create a new topic under a unit. Code is auto-generated if omitted.",
    tags: ["Curriculum - Structure"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        required: ["unitId", "title"],
        properties: {
          unitId: { type: "string", format: "uuid" },
          code: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          orderIndex: { type: "integer" },
          externalId: { type: "string" },
        },
      },
    },
    responses: {
      201: { description: "Topic created successfully" },
      400: { description: "Validation error or version archived" },
      409: { description: "Topic code already exists in this unit" },
    },
  },
  {
    path: "/api/curriculum/structure/topics/{topicId}",
    method: "PUT",
    summary: "Update Curriculum Topic",
    description: "Update title, description, or external ID of a topic.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "topicId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          externalId: { type: "string" },
        },
      },
    },
    responses: {
      200: { description: "Topic updated successfully" },
      404: { description: "Topic not found" },
    },
  },
  {
    path: "/api/curriculum/structure/topics/{topicId}",
    method: "DELETE",
    summary: "Delete Curriculum Topic",
    description: "Delete a curriculum topic and nested objectives.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "topicId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Topic deleted successfully" },
      404: { description: "Topic not found" },
    },
  },
  {
    path: "/api/curriculum/structure/topics/{topicId}/objectives",
    method: "GET",
    summary: "List Learning Objectives by Topic",
    description: "Retrieve paginated learning objectives belonging to a topic.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "topicId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
    ],
    responses: {
      200: { description: "Learning objectives retrieved successfully" },
      404: { description: "Topic not found" },
    },
  },
  {
    path: "/api/curriculum/structure/objectives/{objectiveId}",
    method: "GET",
    summary: "Get Learning Objective by ID",
    description: "Retrieve a specific learning objective record.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "objectiveId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Learning objective retrieved successfully" },
      404: { description: "Learning objective not found" },
    },
  },
  {
    path: "/api/curriculum/structure/objectives",
    method: "POST",
    summary: "Create Learning Objective",
    description: "Create a new learning objective under a topic. Code is auto-generated if omitted.",
    tags: ["Curriculum - Structure"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        required: ["topicId", "statement"],
        properties: {
          topicId: { type: "string", format: "uuid" },
          code: { type: "string" },
          statement: { type: "string" },
          description: { type: "string" },
          orderIndex: { type: "integer" },
          externalId: { type: "string" },
        },
      },
    },
    responses: {
      201: { description: "Learning objective created successfully" },
      400: { description: "Validation error or version archived" },
      409: { description: "Objective code already exists in this topic" },
    },
  },
  {
    path: "/api/curriculum/structure/objectives/{objectiveId}",
    method: "PUT",
    summary: "Update Learning Objective",
    description: "Update statement, description, or external ID of a learning objective.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "objectiveId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          statement: { type: "string" },
          description: { type: "string" },
          externalId: { type: "string" },
        },
      },
    },
    responses: {
      200: { description: "Learning objective updated successfully" },
      404: { description: "Learning objective not found" },
    },
  },
  {
    path: "/api/curriculum/structure/objectives/{objectiveId}",
    method: "DELETE",
    summary: "Delete Learning Objective",
    description: "Delete a learning objective.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "objectiveId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Learning objective deleted successfully" },
      404: { description: "Learning objective not found" },
    },
  },
  {
    path: "/api/curriculum/structure/reorder",
    method: "POST",
    summary: "Reorder Structure Items",
    description: "Reorder units within a subject, topics within a unit, or objectives within a topic.",
    tags: ["Curriculum - Structure"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        required: ["entityType", "parentId", "orderedIds"],
        properties: {
          entityType: { type: "string", enum: ["unit", "topic", "objective"] },
          parentId: { type: "string", format: "uuid" },
          orderedIds: { type: "array", items: { type: "string", format: "uuid" } },
        },
      },
    },
    responses: {
      200: { description: "Items reordered successfully" },
      400: { description: "Validation error" },
    },
  },
  {
    path: "/api/curriculum/structure/versions/{versionId}/tree",
    method: "GET",
    summary: "Get Complete Structure Tree",
    description: "Retrieve full hierarchical curriculum structure tree for a version.",
    tags: ["Curriculum - Structure"],
    security: true,
    parameters: [
      { name: "versionId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Structure tree retrieved successfully" },
      404: { description: "Curriculum version not found" },
    },
  },
];

export const registerStructureDocs = (): void => {
  for (const definition of structureRouteDefinitions) {
    routeRegistry.register(definition as RouteDefinition);
  }
};

registerStructureDocs();
