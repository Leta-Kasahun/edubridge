import {
  AssessmentType,
  AttemptStatus,
} from "@/shared/constants/assessment.constants";
import { QuestionType } from "@/features/question-bank/types/question-bank.types";
import type { AssessmentItem } from "@/features/assessments/types/assessment.types";

export interface ManualGradeItemPayload {
  questionVersionId: string;
  awardedPoints: number;
  feedback?: string | null;
}

export interface ManualGradeAttemptPayload {
  grades: ManualGradeItemPayload[];
  generalFeedback?: string | null;
}

export interface SubmitQuestionFeedbackPayload {
  questionVersionId: string;
  message: string;
  category?: "CLARIFICATION" | "TYPO_REPORT" | "CONTENT_ISSUE" | "GENERAL";
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
