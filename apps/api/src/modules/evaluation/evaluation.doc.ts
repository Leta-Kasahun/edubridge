import { RouteDefinition, routeRegistry } from "../../docs/route.registry.js";
import {
  ManualGradeAttemptSchema,
  SubmitQuestionFeedbackSchema,
} from "./schemas/evaluation.schema.js";

const evaluationRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/assessments/student/results",
    method: "GET",
    summary: "List Student Evaluation Results",
    description: "Retrieve paginated list of evaluated assessments, scores, status, and teacher feedback indicators for the authenticated student.",
    tags: ["Evaluations & Feedback"],
    security: true,
    parameters: [
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
    ],
    responses: {
      200: { description: "Student evaluation results retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/assessments/{id}/attempts/{attemptId}/result",
    method: "GET",
    summary: "Get Assessment Attempt Evaluation Result",
    description: "Retrieve full attempt score, answer breakdown, question points, and instructor remarks/feedback.",
    tags: ["Evaluations & Feedback"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "attemptId", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
      200: { description: "Attempt evaluation result retrieved successfully" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden - not authorized to view results" },
      404: { description: "Attempt not found" },
    },
  },
  {
    path: "/api/assessments/{id}/attempts/{attemptId}/manual-grade",
    method: "PUT",
    summary: "Apply Manual Grading & Instructor Remarks",
    description: "Teachers or School Admins manually score open-ended questions, assign awarded points, and leave per-question or overall feedback notes.",
    tags: ["Evaluations & Feedback"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "attemptId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      required: true,
      schema: ManualGradeAttemptSchema,
    },
    responses: {
      200: { description: "Attempt manual grading and remarks applied successfully" },
      400: { description: "Invalid grading payload" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden - Teacher or Admin only" },
      404: { description: "Attempt not found" },
    },
  },
  {
    path: "/api/assessments/{id}/question-feedback",
    method: "POST",
    summary: "Submit Question Feedback / Issue Report",
    description: "Students or teachers submit feedback, typo alerts, or issue reports for a specific question version in an assessment.",
    tags: ["Evaluations & Feedback"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      required: true,
      schema: SubmitQuestionFeedbackSchema,
    },
    responses: {
      200: { description: "Feedback submitted successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Assessment or Question version not found" },
    },
  },
];

let isRegistered = false;

export const registerEvaluationDocs = (): void => {
  if (isRegistered) return;
  isRegistered = true;

  routeRegistry.registerTag(
    "Evaluations & Feedback",
    "Student assessment evaluations, attempt scoring breakdowns, teacher remarks, manual grading, and question feedback."
  );

  for (const definition of evaluationRouteDefinitions) {
    routeRegistry.register(definition);
  }
};

registerEvaluationDocs();
