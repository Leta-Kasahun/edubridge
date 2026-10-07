import {
  AssessmentType,
  AssessmentStatus,
  GradingMode,
  AttemptStatus,
} from "../../../shared/constants/assessment.constants";
import { QuestionType, DifficultyLevel } from "../../question-bank/types/question-bank.types";

export interface AssessmentQuestionItem {
  assessmentId: string;
  questionVersionId: string;
  orderIndex: number;
  points: number | string;
  questionVersion?: {
    id: string;
    questionId: string;
    version: number;
    type: QuestionType;
    difficulty: DifficultyLevel;
    questionText: string;
    explanation?: string | null;
    imageUrl?: string | null;
    points: number | string;
    configuration?: unknown;
    options?: Array<{
      id: string;
      optionKey: string;
      optionText: string;
      orderIndex: number;
      isCorrect?: boolean;
    }>;
  };
}

export interface AssessmentAssignmentItem {
  id: string;
  assessmentId: string;
  sectionId: string;
  status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  assignedAt: string;
  dueAt?: string | null;
  section?: {
    id: string;
    name: string;
    code: string;
    grade?: {
      id: string;
      name: string;
      level: number;
    };
  };
}

export interface AssessmentItem {
  id: string;
  tenantId: string;
  title: string;
  description?: string | null;
  type: AssessmentType;
  status: AssessmentStatus;
  gradingMode: GradingMode;
  scope?: "SUBJECT" | "GRADE_SUBJECT" | "UNIT" | "TOPIC" | null;
  subjectId?: string | null;
  gradeId?: string | null;
  unitId?: string | null;
  topicId?: string | null;
  curriculumVersionId?: string | null;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResults: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
  createdById: string;
  examContextId?: string | null;
  subject?: {
    id: string;
    name: string;
    code?: string;
  } | null;
  grade?: {
    id: string;
    level: number;
  } | null;
  unit?: {
    id: string;
    title: string;
    code?: string;
  } | null;
  topic?: {
    id: string;
    title: string;
    code?: string;
  } | null;
  examContext?: {
    id: string;
    name: string;
    code: string;
    scope: string;
  } | null;
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  questions?: AssessmentQuestionItem[];
  assignments?: AssessmentAssignmentItem[];
  _count?: {
    questions: number;
    assignments: number;
    attempts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentPayload {
  title: string;
  description?: string | null;
  type: AssessmentType;
  gradingMode?: GradingMode;
  scope?: "SUBJECT" | "GRADE_SUBJECT" | "UNIT" | "TOPIC";
  subjectId?: string | null;
  gradeId?: string | null;
  unitId?: string | null;
  topicId?: string | null;
  curriculumVersionId?: string | null;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  showResults?: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
  examContextId?: string | null;
  questions?: Array<{
    questionVersionId: string;
    orderIndex: number;
    points: number;
  }>;
}

export interface UpdateAssessmentPayload {
  title?: string;
  description?: string | null;
  type?: AssessmentType;
  status?: AssessmentStatus;
  gradingMode?: GradingMode;
  scope?: "SUBJECT" | "GRADE_SUBJECT" | "UNIT" | "TOPIC";
  subjectId?: string | null;
  gradeId?: string | null;
  unitId?: string | null;
  topicId?: string | null;
  curriculumVersionId?: string | null;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  showResults?: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
  examContextId?: string | null;
}

export interface AssessmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: AssessmentType;
  status?: AssessmentStatus;
  gradingMode?: GradingMode;
  scope?: "SUBJECT" | "GRADE_SUBJECT" | "UNIT" | "TOPIC";
  subjectId?: string;
  gradeId?: string;
  unitId?: string;
  topicId?: string;
  curriculumVersionId?: string;
  examContextId?: string;
  academicYearId?: string;
  createdById?: string;
  sortBy?: "createdAt" | "title" | "availableFrom" | "status";
  sortOrder?: "asc" | "desc";
}

export interface AssignAssessmentPayload {
  sectionIds: string[];
  dueAt?: string | null;
}

export interface StudentOptionView {
  id: string;
  optionKey: string;
  optionText: string;
  orderIndex: number;
}

export interface StudentQuestionView {
  questionVersionId: string;
  questionId: string;
  orderIndex: number;
  points: number;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  configuration?: unknown;
  options: StudentOptionView[];
  savedAnswer?: unknown;
}

export interface StudentActiveAttemptSession {
  attemptId: string;
  assessmentId: string;
  assignmentId: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  deadline: string | null;
  timeLimitMinutes: number | null;
  totalQuestions: number;
  totalPoints: number;
  questions: StudentQuestionView[];
  isStaffPreview?: boolean;
}

export type {
  StudentAnswerItem,
  AssessmentAttemptResult,
  ManualGradeItemPayload,
  ManualGradeAttemptPayload,
} from "@/features/evaluations-feedback";

export interface StudentInProgressAssessmentItem {
  id: string;
  assessmentId: string;
  title: string;
  type: AssessmentType;
  timeLimitMinutes?: number | null;
  subjectCode: string;
  subjectName: string;
  startedAt: string;
  totalQuestions: number;
  answeredCount: number;
  progressPercent: number;
}

export type {
  StudentResultItem,
  StudentResultsResponse,
} from "@/features/evaluations-feedback";
