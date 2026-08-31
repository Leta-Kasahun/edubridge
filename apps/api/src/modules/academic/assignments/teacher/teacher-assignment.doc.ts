import { routeRegistry, RouteDefinition } from "../../../../docs/route.registry.js";

const teacherAssignmentRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/academic/assignments/teachers",
    method: "GET",
    summary: "List Teacher Assignments",
    description: "Query active and past teacher assignments filtered by academic year, section, role, and teacher.",
    tags: ["Academic - Teacher Assignments"],
    security: true,
    parameters: [
      { name: "academicYearId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "sectionId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "teacherId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "role", in: "query", schema: { type: "string", enum: ["HOMEROOM_TEACHER", "SUBJECT_TEACHER", "ALL"] } },
      { name: "search", in: "query", schema: { type: "string" } },
    ],
    responses: {
      200: { description: "Teacher assignments list retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/assignments/teachers",
    method: "POST",
    summary: "Assign Teacher",
    description: "Assign a teacher as Homeroom or Subject teacher to a class section.",
    tags: ["Academic - Teacher Assignments"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          teacherId: { type: "string", format: "uuid" },
          academicYearId: { type: "string", format: "uuid" },
          sectionId: { type: "string", format: "uuid" },
          subjectId: { type: "string", format: "uuid" },
          role: { type: "string", enum: ["HOMEROOM_TEACHER", "SUBJECT_TEACHER"] },
        },
        required: ["teacherId", "academicYearId", "sectionId", "role"],
      },
    },
    responses: {
      201: { description: "Teacher assigned successfully" },
      400: { description: "Validation error or section already has homeroom teacher" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/assignments/teachers/{id}/reassign",
    method: "POST",
    summary: "Reassign Teacher Assignment",
    description: "Transition existing class assignment responsibilities to a replacement teacher.",
    tags: ["Academic - Teacher Assignments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          replacementTeacherId: { type: "string", format: "uuid" },
          reason: { type: "string" },
        },
        required: ["replacementTeacherId", "reason"],
      },
    },
    responses: {
      200: { description: "Assignment reassigned successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Assignment not found" },
    },
  },
  {
    path: "/api/academic/assignments/teachers/{id}/end",
    method: "POST",
    summary: "End Teacher Assignment",
    description: "Close out an active teaching assignment with end date and audit reason.",
    tags: ["Academic - Teacher Assignments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          reason: { type: "string" },
        },
        required: ["reason"],
      },
    },
    responses: {
      200: { description: "Assignment ended successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Assignment not found" },
    },
  },
  {
    path: "/api/academic/assignments/teachers/load/{teacherId}",
    method: "GET",
    summary: "Get Teacher Workload Summary",
    description: "Retrieve comprehensive load metrics, active homerooms, and subject classes for a teacher.",
    tags: ["Academic - Teacher Assignments"],
    security: true,
    parameters: [
      { name: "teacherId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "academicYearId", in: "query", schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Teacher workload summary retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Teacher not found" },
    },
  },
];

export const registerTeacherAssignmentDocs = (): void => {
  for (const definition of teacherAssignmentRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
