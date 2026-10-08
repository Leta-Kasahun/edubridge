import { RouteDefinition, routeRegistry } from "../../docs/route.registry.js";
import {
  CreateAssessmentSchema,
  UpdateAssessmentSchema,
  AddAssessmentQuestionsSchema,
  AssignAssessmentSchema,
} from "./schemas/assessment.schema.js";
import {
  StartAttemptSchema,
  SaveAnswerSchema,
  BatchSaveAnswersSchema,
  SubmitAttemptSchema,
} from "./schemas/attempt.schema.js";
import {
  ASSESSMENT_TYPES,
  ASSESSMENT_STATUSES,
  GRADING_MODES,
  ATTEMPT_STATUSES,
} from "../../shared/constants/assessment.constants.js";
import { CONTENT_SCOPES } from "../../shared/constants/learning-content.constants.js";

const assessmentRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/assessments",
    method: "GET",
    summary: "List Assessments",
    description: "Retrieve paginated list of assessments with filtering by type, status, and grading mode.",
    tags: ["Assessment - Assessments"],
    security: true,
    parameters: [
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "type", in: "query", schema: { type: "string", enum: [...ASSESSMENT_TYPES] } },
      { name: "status", in: "query", schema: { type: "string", enum: [...ASSESSMENT_STATUSES] } },
      { name: "gradingMode", in: "query", schema: { type: "string", enum: [...GRADING_MODES] } },
      { name: "scope", in: "query", schema: { type: "string", enum: [...CONTENT_SCOPES] } },
      { name: "subjectId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "gradeId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "unitId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "topicId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "curriculumVersionId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "examContextId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "createdById", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
    ],
    responses: {
      200: { description: "Assessments retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/assessments/{id}",
    method: "GET",
    summary: "Get Assessment Details",
    description: "Retrieve detailed assessment object with linked question versions, options, and assignments.",
    tags: ["Assessment - Assessments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Assessment retrieved successfully" },
      404: { description: "Assessment not found" },
    },
  },
  {
    path: "/api/assessments",
    method: "POST",
    summary: "Create Assessment",
    description: "Create a new assessment shell with configuration rules.",
    tags: ["Assessment - Assessments"],
    security: true,
    requestBody: {
      description: "Assessment payload",
      required: true,
      schema: CreateAssessmentSchema,
    },
    responses: {
      201: { description: "Assessment created successfully" },
      400: { description: "Validation error" },
    },
  },
  {
    path: "/api/assessments/{id}",
    method: "PUT",
    summary: "Update Assessment",
    description: "Update assessment settings, availability window, or timing.",
    tags: ["Assessment - Assessments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      description: "Updated assessment payload",
      required: true,
      schema: UpdateAssessmentSchema,
    },
    responses: {
      200: { description: "Assessment updated successfully" },
      404: { description: "Assessment not found" },
    },
  },
  {
    path: "/api/assessments/{id}/questions",
    method: "PUT",
    summary: "Set Assessment Questions",
    description: "Link and order question versions with point allocations to an assessment.",
    tags: ["Assessment - Assessments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      description: "Question mapping array",
      required: true,
      schema: AddAssessmentQuestionsSchema,
    },
    responses: {
      200: { description: "Assessment questions updated successfully" },
      400: { description: "Cannot alter questions with existing attempts" },
    },
  },
  {
    path: "/api/assessments/{id}/assign",
    method: "POST",
    summary: "Assign Assessment to Sections",
    description: "Assign an assessment to one or more school sections with due dates.",
    tags: ["Assessment - Assignments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      description: "Section IDs and due date",
      required: true,
      schema: AssignAssessmentSchema,
    },
    responses: {
      200: { description: "Assessment assigned successfully" },
    },
  },
  {
    path: "/api/assessments/{id}/publish",
    method: "POST",
    summary: "Publish Assessment",
    description: "Change assessment status to PUBLISHED making it active for assignments.",
    tags: ["Assessment - Assessments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Assessment published successfully" },
    },
  },
  {
    path: "/api/assessments/{id}/unarchive",
    method: "POST",
    summary: "Unarchive Assessment",
    description: "Restore an archived assessment back to DRAFT status.",
    tags: ["Assessment - Assessments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Assessment restored from archive successfully" },
    },
  },
  {
    path: "/api/assessments/{id}",
    method: "DELETE",
    summary: "Archive Assessment",
    description: "Soft delete and archive an assessment.",
    tags: ["Assessment - Assessments"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Assessment archived successfully" },
    },
  },
  {
    path: "/api/assessments/{id}/attempts/start",
    method: "POST",
    summary: "Start Student Attempt",
    description: "Initialize or resume a student attempt session with server-side timer.",
    tags: ["Assessment - Attempts"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      description: "Assignment ID",
      required: true,
      schema: StartAttemptSchema,
    },
    responses: {
      200: { description: "Attempt started or resumed" },
      400: { description: "Attempt limit reached or unavailable" },
      403: { description: "Student not enrolled in section" },
    },
  },
  {
    path: "/api/assessments/{id}/attempts/{attemptId}/answers",
    method: "PUT",
    summary: "Autosave Single Answer",
    description: "Save response for a single question during an active attempt session.",
    tags: ["Assessment - Attempts"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "attemptId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      description: "Single answer response",
      required: true,
      schema: SaveAnswerSchema,
    },
    responses: {
      200: { description: "Answer saved" },
    },
  },
  {
    path: "/api/assessments/{id}/attempts/{attemptId}/answers/batch",
    method: "POST",
    summary: "Batch Save Answers",
    description: "Batch save multiple question answers for offline sync or bulk submission.",
    tags: ["Assessment - Attempts"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "attemptId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      description: "Array of responses",
      required: true,
      schema: BatchSaveAnswersSchema,
    },
    responses: {
      200: { description: "Answers saved" },
    },
  },
  {
    path: "/api/assessments/{id}/attempts/{attemptId}/submit",
    method: "POST",
    summary: "Submit Attempt",
    description: "Finalize attempt, execute grading engine, and generate composite score.",
    tags: ["Assessment - Attempts"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "attemptId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      description: "Optional final answers payload",
      required: false,
      schema: SubmitAttemptSchema,
    },
    responses: {
      200: { description: "Attempt submitted and graded" },
    },
  },
  {
    path: "/api/assessments/{id}/attempts",
    method: "GET",
    summary: "List Assessment Attempts",
    description: "Retrieve all student attempts for a given assessment with section and status filters.",
    tags: ["Assessment - Attempts"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      { name: "studentId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "sectionId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "status", in: "query", schema: { type: "string", enum: [...ATTEMPT_STATUSES] } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
    ],
    responses: {
      200: { description: "Attempts retrieved successfully" },
    },
  },
];

assessmentRouteDefinitions.forEach((def) => routeRegistry.register(def));
