import {
  AssessmentTypeEnum,
  AssessmentStatusEnum,
  GradingModeEnum,
  AssessmentAssignmentStatusEnum,
  AttemptStatusEnum,
} from "../../../shared/constants/assessment.constants.js";
import { QuestionTypeEnum, DifficultyLevelEnum } from "../../../shared/constants/question-bank.constants.js";
import { ContentScopeEnum } from "../../../shared/constants/learning-content.constants.js";

export interface AssessmentQuestionInput {
  questionVersionId: string;
  orderIndex: number;
  points: number;
}

export interface CreateAssessmentDto {
  title: string;
  description?: string | null;
  type: AssessmentTypeEnum;
  gradingMode?: GradingModeEnum;
  scope?: ContentScopeEnum;
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
  availableFrom?: Date | string | null;
  availableUntil?: Date | string | null;
  examContextId?: string | null;
  questions?: AssessmentQuestionInput[];
}

export interface UpdateAssessmentDto {
  title?: string;
  description?: string | null;
  type?: AssessmentTypeEnum;
  status?: AssessmentStatusEnum;
  gradingMode?: GradingModeEnum;
  scope?: ContentScopeEnum;
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
  availableFrom?: Date | string | null;
  availableUntil?: Date | string | null;
  examContextId?: string | null;
}

export interface AssessmentQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: AssessmentTypeEnum;
  status?: AssessmentStatusEnum;
  gradingMode?: GradingModeEnum;
  scope?: ContentScopeEnum;
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

export interface AssignAssessmentDto {
  sectionIds: string[];
  dueAt?: Date | string | null;
}

export interface UpdateAssignmentDto {
  status?: AssessmentAssignmentStatusEnum;
  dueAt?: Date | string | null;
}

export interface StartAttemptDto {
  assignmentId: string;
}

export interface SaveAnswerDto {
  questionVersionId: string;
  response: unknown;
}

export interface BatchSaveAnswersDto {
  answers: Array<{
    questionVersionId: string;
    response: unknown;
  }>;
}

export interface SubmitAttemptPayload {
  answers?: Array<{
    questionVersionId: string;
    response: unknown;
  }>;
}

export interface AttemptQueryFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  assignmentId?: string;
  sectionId?: string;
  status?: AttemptStatusEnum;
  sortBy?: "startedAt" | "submittedAt" | "score";
  sortOrder?: "asc" | "desc";
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
  type: QuestionTypeEnum;
  difficulty: DifficultyLevelEnum;
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
  status: AttemptStatusEnum;
  startedAt: string;
  deadline: string | null;
  timeLimitMinutes: number | null;
  totalQuestions: number;
  totalPoints: number;
  questions: StudentQuestionView[];
  isStaffPreview?: boolean;
}
