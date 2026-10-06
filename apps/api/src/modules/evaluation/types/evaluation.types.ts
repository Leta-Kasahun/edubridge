export interface ManualGradeAnswerDto {
  questionVersionId: string;
  awardedPoints: number;
  feedback?: string | null;
}

export interface ManualGradeAttemptDto {
  grades: ManualGradeAnswerDto[];
  generalFeedback?: string | null;
}

export interface SubmitQuestionFeedbackInput {
  questionVersionId: string;
  category: "CONTENT_ERROR" | "TYPO" | "CONFUSING" | "INCORRECT_ANSWER" | "OTHER" | string;
  message: string;
}

export interface StudentResultItem {
  id: string;
  assessmentId: string;
  title: string;
  type: string;
  timeLimitMinutes?: number | null;
  subjectCode: string;
  subjectName: string;
  submittedAt?: string | null;
  gradedAt?: string | null;
  status: string;
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
