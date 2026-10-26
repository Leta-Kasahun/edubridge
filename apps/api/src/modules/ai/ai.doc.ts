import { routeRegistry, RouteDefinition } from "../../docs/route.registry.js";

const aiRouteDefinitions: readonly RouteDefinition[] = [
  {
    path: "/api/ai/questions/{id}/explanation/stream",
    method: "GET",
    summary: "Stream Answer Explanation (SSE)",
    description: "Stream an educational, student-friendly explanation for a question using Server-Sent Events.",
    tags: ["AI - Educational Explanations"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "studentAnswer", in: "query", schema: { type: "string" }, description: "Optional student answer to critique" },
    ],
    responses: {
      200: { description: "Text/event-stream of explanation tokens" },
      401: { description: "Unauthorized" },
      404: { description: "Question not found" },
      429: { description: "Rate limit exceeded" },
    },
  },
  {
    path: "/api/ai/questions/generate",
    method: "POST",
    summary: "Generate Practice Questions",
    description: "Use curriculum context and RAG to generate Bloom's taxonomy aligned practice questions saved as draft.",
    tags: ["AI - Content & Question Generation"],
    security: true,
    requestBody: {
      required: true,
      schema: {
        type: "object",
        required: ["subjectId", "topicId"],
        properties: {
          subjectId: { type: "string", format: "uuid" },
          gradeId: { type: "string", format: "uuid" },
          topicId: { type: "string", format: "uuid" },
          count: { type: "integer", default: 5, minimum: 1, maximum: 20 },
          difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"], default: "MEDIUM" },
          questionType: { type: "string", enum: ["MCQ", "TRUE_FALSE", "SHORT_ANSWER"], default: "MCQ" },
          questionBankId: { type: "string", format: "uuid" },
        },
      },
    },
    responses: {
      200: { description: "Questions successfully generated and saved" },
      400: { description: "Invalid generation parameters" },
      401: { description: "Unauthorized" },
      429: { description: "Rate limit exceeded" },
    },
  },
  {
    path: "/api/ai/content/generate",
    method: "POST",
    summary: "Generate Curriculum Content",
    description: "Draft curriculum learning materials grounded in existing textbook/reference chunks.",
    tags: ["AI - Content & Question Generation"],
    security: true,
    requestBody: {
      required: true,
      schema: {
        type: "object",
        required: ["subjectId", "topicId"],
        properties: {
          subjectId: { type: "string", format: "uuid" },
          gradeId: { type: "string", format: "uuid" },
          topicId: { type: "string", format: "uuid" },
          contentType: { type: "string", enum: ["LESSON_NOTE", "SUMMARY", "STUDY_GUIDE", "WORKSHEET"], default: "LESSON_NOTE" },
          tone: { type: "string", enum: ["ACADEMIC", "SIMPLIFIED", "ENGAGING"], default: "ENGAGING" },
          targetGradeLevel: { type: "integer", minimum: 1, maximum: 12 },
        },
      },
    },
    responses: {
      200: { description: "Content draft created successfully" },
      400: { description: "Invalid content parameters" },
      401: { description: "Unauthorized" },
      429: { description: "Rate limit exceeded" },
    },
  },
  {
    path: "/api/ai/jobs",
    method: "GET",
    summary: "List AI Generation Jobs",
    description: "Retrieve paginated history of AI generation jobs for audit and reproducibility.",
    tags: ["AI - Generation Audit"],
    security: true,
    parameters: [
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
    ],
    responses: {
      200: { description: "List of generation jobs" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/ai/jobs/{id}",
    method: "GET",
    summary: "Get AI Generation Job Details",
    description: "Retrieve details and status of an AI generation job.",
    tags: ["AI - Generation Audit"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Job details retrieved" },
      401: { description: "Unauthorized" },
      404: { description: "Job not found" },
    },
  },
];

export function registerAiDocs(): void {
  aiRouteDefinitions.forEach((def) => {
    routeRegistry.register(def);
  });
}
