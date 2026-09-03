import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const curriculumImportRouteDefinitions: readonly RouteDefinition[] = [
  {
    path: "/api/curriculum/import/preview",
    method: "POST",
    summary: "Preview Curriculum Structure Import",
    description: "Parses, normalizes, and validates curriculum structure rows (CSV/JSON), resolving Grade/Subject references and auto-generating preview codes without committing database changes.",
    tags: ["Curriculum - Import"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          curriculumVersionId: { type: "string", format: "uuid" },
          csvContent: { type: "string", description: "Raw CSV text" },
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gradeLevel: { type: "number", example: 9 },
                subjectName: { type: "string", example: "Mathematics" },
                unitTitle: { type: "string", example: "Number Systems" },
                unitCode: { type: "string", example: "U-1" },
                topicTitle: { type: "string", example: "Rational Numbers" },
                topicCode: { type: "string", example: "U-1-T1" },
                objectiveStatement: { type: "string", example: "Classify rational and irrational numbers" },
                objectiveCode: { type: "string", example: "U-1-T1-LO1" },
              },
              required: ["gradeLevel", "subjectName", "unitTitle", "topicTitle", "objectiveStatement"],
            },
          },
        },
        required: ["curriculumVersionId"],
      },
    },
    responses: {
      200: { description: "Curriculum import preview generated successfully" },
      400: { description: "Validation error or invalid file" },
      401: { description: "Unauthorized" },
      404: { description: "Curriculum version not found" },
    },
  },
  {
    path: "/api/curriculum/import/commit",
    method: "POST",
    summary: "Commit Curriculum Structure Import",
    description: "Transactionally creates curriculum subjects, units, topics, and learning objectives from validated import rows, automatically generating unique sequential codes.",
    tags: ["Curriculum - Import"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          curriculumVersionId: { type: "string", format: "uuid" },
          csvContent: { type: "string" },
          rows: {
            type: "array",
            items: { type: "object" },
          },
        },
        required: ["curriculumVersionId"],
      },
    },
    responses: {
      200: { description: "Curriculum structure imported and committed successfully" },
      400: { description: "Import validation failed" },
      401: { description: "Unauthorized" },
      404: { description: "Curriculum version not found" },
    },
  },
  {
    path: "/api/curriculum/import/template",
    method: "GET",
    summary: "Download Curriculum Import CSV Template",
    description: "Downloads the standardized CSV template conforming to Ethiopian curriculum hierarchy (Grade, Subject, Unit, Topic, Learning Objective).",
    tags: ["Curriculum - Import"],
    security: true,
    responses: {
      200: { description: "CSV template file stream" },
      401: { description: "Unauthorized" },
    },
  },
];

export const registerCurriculumImportDocs = (): void => {
  for (const definition of curriculumImportRouteDefinitions) {
    routeRegistry.register(definition as RouteDefinition);
  }
};

registerCurriculumImportDocs();
