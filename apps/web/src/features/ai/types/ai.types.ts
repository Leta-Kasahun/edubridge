export type AiJobType = "CONTENT_GENERATION" | "QUESTION_GENERATION";
export type AiJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type QuestionScope = "TOPIC" | "UNIT" | "SUBJECT" | "MOCK_EXAM";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD" | "MIXED";
export type QuestionTypeFormat = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "NUMERIC" | "MIXED";
export type ContentScope = "TOPIC" | "UNIT" | "SUBJECT";
export type ContentTypeFormat = "LESSON_NOTE" | "SUMMARY" | "STUDY_GUIDE" | "WORKSHEET";
export type ContentTone = "ACADEMIC" | "SIMPLIFIED" | "ENGAGING";

export interface QuestionTypeDistribution {
  readonly MCQ?: number;
  readonly TRUE_FALSE?: number;
  readonly SHORT_ANSWER?: number;
  readonly NUMERIC?: number;
}

export interface GenerateQuestionsDto {
  readonly scope?: QuestionScope;
  readonly subjectId: string;
  readonly gradeId?: string;
  readonly unitId?: string;
  readonly topicId?: string;
  readonly examContextId?: string;
  readonly count?: number;
  readonly difficulty?: QuestionDifficulty;
  readonly questionType?: QuestionTypeFormat;
  readonly typeDistribution?: QuestionTypeDistribution;
  readonly questionBankId?: string;
}

export interface GenerateContentDto {
  readonly scope?: ContentScope;
  readonly subjectId: string;
  readonly gradeId?: string;
  readonly unitId?: string;
  readonly topicId?: string;
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
