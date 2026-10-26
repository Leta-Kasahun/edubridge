export type AiJobType = "CONTENT_GENERATION" | "QUESTION_GENERATION";
export type AiJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionTypeFormat = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
export type ContentTypeFormat = "LESSON_NOTE" | "SUMMARY" | "STUDY_GUIDE" | "WORKSHEET";
export type ContentTone = "ACADEMIC" | "SIMPLIFIED" | "ENGAGING";

export interface GenerateQuestionsDto {
  readonly subjectId: string;
  readonly gradeId?: string;
  readonly topicId: string;
  readonly count?: number;
  readonly difficulty?: QuestionDifficulty;
  readonly questionType?: QuestionTypeFormat;
  readonly questionBankId?: string;
}

export interface GenerateContentDto {
  readonly subjectId: string;
  readonly gradeId?: string;
  readonly topicId: string;
  readonly contentType?: ContentTypeFormat;
  readonly tone?: ContentTone;
  readonly targetGradeLevel?: number;
}

export interface GeneratedQuestionOption {
  readonly optionKey: "A" | "B" | "C" | "D";
  readonly optionText: string;
  readonly isCorrect: boolean;
}

export interface GeneratedQuestionItem {
  readonly questionText: string;
  readonly type: QuestionTypeFormat;
  readonly difficulty: QuestionDifficulty;
  readonly points: number;
  readonly explanation: string;
  readonly options?: readonly GeneratedQuestionOption[];
}

export interface AiJobItem {
  readonly id: string;
  readonly tenantId: string;
  readonly jobType: AiJobType;
  readonly status: AiJobStatus;
  readonly requestedById: string;
  readonly inputParams: unknown;
  readonly outputSummary?: {
    readonly count?: number;
    readonly questionBankId?: string;
    readonly questionIds?: readonly string[];
    readonly contentId?: string;
    readonly title?: string;
  } | null;
  readonly model: string;
  readonly promptTokens?: number | null;
  readonly outputTokens?: number | null;
  readonly errorMessage?: string | null;
  readonly createdAt: string;
  readonly completedAt?: string | null;
}

export interface GenerateQuestionsResponse {
  readonly job: AiJobItem;
  readonly questionBankId: string;
  readonly questionsCreated: number;
  readonly questionIds: readonly string[];
}

export interface GenerateContentResponse {
  readonly job: AiJobItem;
  readonly contentId: string;
  readonly title: string;
}

export interface ExplanationStreamState {
  readonly text: string;
  readonly isStreaming: boolean;
  readonly error: string | null;
}
