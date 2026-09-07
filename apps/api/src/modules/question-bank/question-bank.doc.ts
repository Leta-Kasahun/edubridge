import { RouteDefinition, routeRegistry } from "../../docs/route.registry.js";
import {
  CreateQuestionBankSchema,
  UpdateQuestionBankSchema,
} from "./schemas/question-bank.schema.js";
import {
  CreateQuestionSchema,
  UpdateQuestionSchema,
} from "./schemas/question.schema.js";
import {
  CreateExamContextSchema,
  UpdateExamContextSchema,
} from "./schemas/exam-context.schema.js";
import { ConfirmUploadSchema } from "./schemas/question-upload.schema.js";
import {
  QUESTION_TYPES,
  QUESTION_STATUSES,
  DIFFICULTY_LEVELS,
  EXAM_SCOPES,
} from "../../shared/constants/question-bank.constants.js";

const questionBankRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/question-banks",
    method: "GET",
    summary: "List Question Banks",
    description: "Retrieve paginated question banks filtered by status, exam context, or search query.",
    tags: ["Question Bank - Banks"],
    security: true,
    parameters: [
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "status", in: "query", schema: { type: "string", enum: ["DRAFT", "ACTIVE", "ARCHIVED"] } },
      { name: "examContextId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "createdById", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
    ],
    responses: {
      200: { description: "Question banks retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/question-banks/{id}",
    method: "GET",
    summary: "Get Question Bank Details",
    description: "Retrieve details of a single question bank including question count and linked exam contexts.",
    tags: ["Question Bank - Banks"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Question bank retrieved successfully" },
      404: { description: "Question bank not found" },
    },
  },
  {
    path: "/api/question-banks",
    method: "POST",
    summary: "Create Question Bank",
    description: "Create a new question bank for an authorized teacher or administrator.",
    tags: ["Question Bank - Banks"],
    security: true,
    requestBody: CreateQuestionBankSchema,
    responses: {
      201: { description: "Question bank created successfully" },
      400: { description: "Validation error" },
    },
  },
  {
    path: "/api/question-banks/{id}",
    method: "PUT",
    summary: "Update Question Bank",
    description: "Update title, description, status, or linked exam context.",
    tags: ["Question Bank - Banks"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: UpdateQuestionBankSchema,
    responses: {
      200: { description: "Question bank updated successfully" },
      404: { description: "Question bank not found" },
    },
  },
  {
    path: "/api/question-banks/{id}",
    method: "DELETE",
    summary: "Delete Question Bank",
    description: "Delete an empty question bank.",
    tags: ["Question Bank - Banks"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Question bank deleted successfully" },
      400: { description: "Cannot delete question bank containing questions" },
      404: { description: "Question bank not found" },
    },
  },
  {
    path: "/api/question-banks/{bankId}/questions",
    method: "GET",
    summary: "List Questions in Bank",
    description: "Retrieve paginated questions within a specific question bank filtered by type, difficulty, topic, or objective.",
    tags: ["Question Bank - Questions"],
    security: true,
    parameters: [
      { name: "bankId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "type", in: "query", schema: { type: "string", enum: [...QUESTION_TYPES] } },
      { name: "difficulty", in: "query", schema: { type: "string", enum: [...DIFFICULTY_LEVELS] } },
      { name: "status", in: "query", schema: { type: "string", enum: [...QUESTION_STATUSES] } },
      { name: "topicId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "objectiveId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
    ],
    responses: {
      200: { description: "Questions retrieved successfully" },
      404: { description: "Question bank not found" },
    },
  },
  {
    path: "/api/question-banks/{bankId}/questions",
    method: "POST",
    summary: "Create Question in Bank",
    description: "Create a new curriculum-linked question with version 1.",
    tags: ["Question Bank - Questions"],
    security: true,
    parameters: [
      { name: "bankId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: CreateQuestionSchema,
    responses: {
      201: { description: "Question created successfully" },
      400: { description: "Invalid question configuration" },
    },
  },
  {
    path: "/api/question-banks/questions/{id}",
    method: "GET",
    summary: "Get Question Detail",
    description: "Retrieve question detail with all version history and mapped topics/objectives.",
    tags: ["Question Bank - Questions"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Question retrieved successfully" },
      404: { description: "Question not found" },
    },
  },
  {
    path: "/api/question-banks/questions/{id}",
    method: "PUT",
    summary: "Update Question",
    description: "Update question content. If question is published, creates a new QuestionVersion (v+1) to preserve past assessment results.",
    tags: ["Question Bank - Questions"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: UpdateQuestionSchema,
    responses: {
      200: { description: "Question updated successfully" },
      404: { description: "Question not found" },
    },
  },
  {
    path: "/api/question-banks/questions/{id}/publish",
    method: "POST",
    summary: "Publish Question",
    description: "Publish a question directly for use in assessments.",
    tags: ["Question Bank - Questions"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Question published successfully" },
      404: { description: "Question not found" },
    },
  },
  {
    path: "/api/question-banks/questions/{id}",
    method: "DELETE",
    summary: "Delete Question",
    description: "Delete a question from a question bank.",
    tags: ["Question Bank - Questions"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Question deleted successfully" },
      404: { description: "Question not found" },
    },
  },
  {
    path: "/api/question-banks/{bankId}/upload",
    method: "POST",
    summary: "Upload Document for Extraction",
    description: "Upload a PDF or image exam paper to extract candidate question blocks using unpdf digital text and OCR fallback.",
    tags: ["Question Bank - Upload & Ingestion"],
    security: true,
    parameters: [
      { name: "bankId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Document extracted and staged successfully" },
      400: { description: "Invalid file format or upload failure" },
    },
  },
  {
    path: "/api/question-banks/upload/{uploadId}/preview",
    method: "GET",
    summary: "Get Upload Preview",
    description: "Retrieve extracted candidate blocks and pages for teacher review before confirmation.",
    tags: ["Question Bank - Upload & Ingestion"],
    security: true,
    parameters: [
      { name: "uploadId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Staged upload retrieved successfully" },
      404: { description: "Upload preview session expired or not found" },
    },
  },
  {
    path: "/api/question-banks/{bankId}/upload/{uploadId}/confirm",
    method: "POST",
    summary: "Confirm and Import Questions",
    description: "Commit verified candidate questions to the target question bank.",
    tags: ["Question Bank - Upload & Ingestion"],
    security: true,
    parameters: [
      { name: "bankId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "uploadId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: ConfirmUploadSchema,
    responses: {
      201: { description: "Questions imported successfully" },
      400: { description: "Validation error on confirmation data" },
    },
  },
  {
    path: "/api/exam-contexts",
    method: "GET",
    summary: "List Exam Contexts",
    description: "Retrieve paginated exam contexts for Grade 8/12, National, Regional, and School exams.",
    tags: ["Exam Context - Standards"],
    security: true,
    parameters: [
      { name: "scope", in: "query", schema: { type: "string", enum: [...EXAM_SCOPES] } },
      { name: "gradeId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "subjectId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "examYear", in: "query", schema: { type: "integer" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
    ],
    responses: {
      200: { description: "Exam contexts retrieved successfully" },
    },
  },
  {
    path: "/api/exam-contexts",
    method: "POST",
    summary: "Create Exam Context",
    description: "Create an exam context representing Grade 8/12 national/regional exam metadata.",
    tags: ["Exam Context - Standards"],
    security: true,
    requestBody: CreateExamContextSchema,
    responses: {
      201: { description: "Exam context created successfully" },
    },
  },
  {
    path: "/api/exam-contexts/{id}",
    method: "GET",
    summary: "Get Exam Context Detail",
    description: "Retrieve exam context details and counts of linked question banks and assessments.",
    tags: ["Exam Context - Standards"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Exam context retrieved successfully" },
      404: { description: "Exam context not found" },
    },
  },
  {
    path: "/api/exam-contexts/{id}",
    method: "PUT",
    summary: "Update Exam Context",
    description: "Update exam context metadata.",
    tags: ["Exam Context - Standards"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: UpdateExamContextSchema,
    responses: {
      200: { description: "Exam context updated successfully" },
      404: { description: "Exam context not found" },
    },
  },
  {
    path: "/api/exam-contexts/{id}",
    method: "DELETE",
    summary: "Delete Exam Context",
    description: "Delete an unlinked exam context.",
    tags: ["Exam Context - Standards"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Exam context deleted successfully" },
      400: { description: "Cannot delete exam context with linked banks or assessments" },
      404: { description: "Exam context not found" },
    },
  },
];

export const registerQuestionBankDocs = () => {
  for (const definition of questionBankRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
