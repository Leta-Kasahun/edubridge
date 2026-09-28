import { routeRegistry, RouteDefinition } from "../../docs/route.registry.js";

const masteryRouteDefinitions: readonly RouteDefinition[] = [
  {
    path: "/api/mastery/sections/{sectionId}",
    method: "GET",
    summary: "Get Section Mastery Matrix",
    description: "Retrieve class section competency mastery matrix with topic proficiency levels, average accuracy, and student breakdown.",
    tags: ["Mastery - Progress"],
    security: true,
    parameters: [
      {
        name: "sectionId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Class Section UUID",
      },
      {
        name: "subjectId",
        in: "query",
        required: false,
        schema: { type: "string", format: "uuid" },
        description: "Filter by subject UUID",
      },
      {
        name: "academicYearId",
        in: "query",
        required: false,
        schema: { type: "string", format: "uuid" },
        description: "Filter by academic year UUID",
      },
    ],
    responses: {
      200: { description: "Section mastery matrix retrieved successfully" },
      400: { description: "Invalid request parameters" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden - Insufficient permissions" },
      404: { description: "Section not found" },
    },
  },
  {
    path: "/api/mastery/students/{studentId}",
    method: "GET",
    summary: "Get Student Mastery Overview",
    description: "Retrieve comprehensive competency mastery overview for a student grouped by subject, unit, and topic.",
    tags: ["Mastery - Progress"],
    security: true,
    parameters: [
      {
        name: "studentId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Student UUID",
      },
      {
        name: "subjectId",
        in: "query",
        required: false,
        schema: { type: "string", format: "uuid" },
        description: "Filter by subject UUID",
      },
    ],
    responses: {
      200: { description: "Student mastery overview retrieved successfully" },
      400: { description: "Invalid request parameters" },
      401: { description: "Unauthorized" },
      404: { description: "Student not found" },
    },
  },
  {
    path: "/api/mastery/students/{studentId}/topics/{topicId}/history",
    method: "GET",
    summary: "Get Topic Mastery Attempt History",
    description: "Retrieve chronological assessment attempts, accuracy progression, and evidence timeline for a specific topic.",
    tags: ["Mastery - Progress"],
    security: true,
    parameters: [
      {
        name: "studentId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Student UUID",
      },
      {
        name: "topicId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Curriculum Topic UUID",
      },
    ],
    responses: {
      200: { description: "Topic mastery attempt history retrieved successfully" },
      400: { description: "Invalid request parameters" },
      401: { description: "Unauthorized" },
      404: { description: "Student or topic not found" },
    },
  },
];

export const registerMasteryDocs = (): void => {
  routeRegistry.registerTag(
    "Mastery - Progress",
    "Competency-based student mastery evaluations, progress matrices, and evidence history."
  );

  for (const definition of masteryRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
