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
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResults: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
  createdById: string;
  examContextId?: string | null;
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

export interface StudentAnswerItem {
  id: string;
  attemptId: string;
  questionVersionId: string;
  answer?: unknown;
  status: "UNANSWERED" | "ANSWERED" | "FLAGGED" | "GRADED";
  isCorrect?: boolean | null;
  awardedPoints?: number | string | null;
  maxPoints?: number | string | null;
  feedback?: string | null;
  questionVersion?: {
    id: string;
    type: QuestionType;
    questionText: string;
    explanation?: string | null;
    options?: Array<{
      id: string;
      optionKey: string;
      optionText: string;
      isCorrect?: boolean;
    }>;
  };
}

export interface AssessmentAttemptResult {
  id: string;
  assessmentId: string;
  assignmentId: string;
  studentId: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string | null;
  gradedAt?: string | null;
  score?: number | string | null;
  maxScore?: number | string | null;
  percentage?: number | string | null;
  generalFeedback?: string | null;
  assessment?: AssessmentItem;
  answers?: StudentAnswerItem[];
  isStaffPreview?: boolean;
  student?: {
    id: string;
    studentCode: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface ManualGradeItemPayload {
  questionVersionId: string;
  awardedPoints: number;
  feedback?: string | null;
}

export interface ManualGradeAttemptPayload {
  grades: ManualGradeItemPayload[];
  generalFeedback?: string | null;
}

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

export interface StudentResultItem {
  id: string;
  assessmentId: string;
  title: string;
  type: AssessmentType;
  timeLimitMinutes?: number | null;
  subjectCode: string;
  subjectName: string;
  submittedAt?: string | null;
  gradedAt?: string | null;
  status: AttemptStatus;
  score: number;
  maxScore: number;
  percentage: number;
  hasTeacherFeedback: boolean;
  generalFeedback?: string | null;
  feedbackCount: number;
}

export interface StudentResultsResponse {
  items: StudentResultItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
