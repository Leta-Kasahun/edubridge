import { routeRegistry, RouteDefinition } from "../../../../docs/route.registry.js";

const studentAssignmentRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/academic/assignments/students/roster",
    method: "GET",
    summary: "Get Student Assignment Roster",
    description: "Query student roster with academic year, grade, section filters, search, and pagination.",
    tags: ["Academic - Student Assignments"],
    security: true,
    parameters: [
      { name: "academicYearId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "gradeLevel", in: "query", schema: { type: "integer" } },
      { name: "sectionId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "status", in: "query", schema: { type: "string", enum: ["ENROLLED", "WITHDRAWN", "TRANSFERRED", "PROMOTED", "RETAINED", "ALL"] } },
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "page", in: "query", schema: { type: "integer" } },
      { name: "limit", in: "query", schema: { type: "integer" } },
    ],
    responses: {
      200: { description: "Student roster retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/assignments/students/sections-capacity",
    method: "GET",
    summary: "Get Sections Capacity for Grade",
    description: "Retrieve capacity and active enrollment counts for sections within a grade level.",
    tags: ["Academic - Student Assignments"],
    security: true,
    parameters: [
      { name: "academicYearId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "gradeLevel", in: "query", schema: { type: "integer" } },
    ],
    responses: {
      200: { description: "Section capacities retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/assignments/students/{studentId}/transfer",
    method: "POST",
    summary: "Transfer Student Section",
    description: "Transfer a single student to another section in the same grade level.",
    tags: ["Academic - Student Assignments"],
    security: true,
    parameters: [
      { name: "studentId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          targetSectionId: { type: "string", format: "uuid" },
          reason: { type: "string" },
        },
        required: ["targetSectionId", "reason"],
      },
    },
    responses: {
      200: { description: "Student transferred successfully" },
      400: { description: "Validation error or section at capacity" },
      401: { description: "Unauthorized" },
      404: { description: "Student or section not found" },
    },
  },
  {
    path: "/api/academic/assignments/students/bulk-transfer",
    method: "POST",
    summary: "Bulk Transfer Students",
    description: "Transfer multiple selected students to a destination section.",
    tags: ["Academic - Student Assignments"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          studentIds: { type: "array", items: { type: "string", format: "uuid" } },
          targetSectionId: { type: "string", format: "uuid" },
          reason: { type: "string" },
        },
        required: ["studentIds", "targetSectionId", "reason"],
      },
    },
    responses: {
      200: { description: "Students transferred successfully" },
      400: { description: "Validation error or insufficient section capacity" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/assignments/students/promotion-preview",
    method: "GET",
    summary: "Preview Year-End Promotions",
    description: "Generate promotion placement preview from source academic year to target academic year.",
    tags: ["Academic - Student Assignments"],
    security: true,
    parameters: [
      { name: "sourceAcademicYearId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "targetAcademicYearId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "gradeLevel", in: "query", schema: { type: "integer" } },
    ],
    responses: {
      200: { description: "Promotion preview generated successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/assignments/students/commit-promotion",
    method: "POST",
    summary: "Execute Year-End Promotion",
    description: "Commit student promotion and section placements into the target academic year session.",
    tags: ["Academic - Student Assignments"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          sourceAcademicYearId: { type: "string", format: "uuid" },
          targetAcademicYearId: { type: "string", format: "uuid" },
          decisions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                studentId: { type: "string", format: "uuid" },
                decision: { type: "string", enum: ["PROMOTE", "RETAIN"] },
                targetGradeId: { type: "string", format: "uuid" },
                targetSectionId: { type: "string", format: "uuid" },
              },
              required: ["studentId", "decision", "targetGradeId", "targetSectionId"],
            },
          },
        },
        required: ["sourceAcademicYearId", "targetAcademicYearId", "decisions"],
      },
    },
    responses: {
      200: { description: "Promotions committed successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/academic/assignments/students/{studentId}/withdraw",
    method: "POST",
    summary: "Withdraw Student from Section",
    description: "End student active section placement for the current academic session with audit reason.",
    tags: ["Academic - Student Assignments"],
    security: true,
    parameters: [
      { name: "studentId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          academicYearId: { type: "string", format: "uuid" },
          reason: { type: "string" },
        },
        required: ["reason"],
      },
    },
    responses: {
      200: { description: "Student withdrawn successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Active enrollment not found" },
    },
  },
  {
    path: "/api/academic/assignments/students/{studentId}/history",
    method: "GET",
    summary: "Get Student Enrollment History",
    description: "Retrieve multi-year enrollment timeline and section placements for a student.",
    tags: ["Academic - Student Assignments"],
    security: true,
    parameters: [
      { name: "studentId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Enrollment history retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Student not found" },
    },
  },
];

export const registerStudentAssignmentDocs = (): void => {
  for (const definition of studentAssignmentRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
