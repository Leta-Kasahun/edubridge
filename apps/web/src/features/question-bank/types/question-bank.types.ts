export type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "LONG_ANSWER"
  | "NUMERIC"
  | "MATCHING"
  | "ORDERING";

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export type QuestionStatus =
  | "DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

export type QuestionSourceType = "TEACHER" | "SYSTEM" | "AI" | "IMPORTED";

export type QuestionBankStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type ExamScope = "GENERAL" | "SCHOOL" | "REGIONAL" | "NATIONAL";

export type ExamContextStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface QuestionOptionItem {
  readonly id?: string;
  readonly text: string;
  readonly isCorrect: boolean;
  readonly explanation?: string | null;
  readonly orderIndex: number;
}

export interface QuestionVersionItem {
  readonly id: string;
  readonly versionNumber: number;
  readonly prompt: string;
  readonly explanation?: string | null;
  readonly hint?: string | null;
  readonly metadata?: Record<string, unknown> | null;
  readonly changeLog?: string | null;
  readonly options: readonly QuestionOptionItem[];
  readonly createdAt: string;
}

export interface QuestionListItem {
  readonly id: string;
  readonly code: string;
  readonly questionBankId: string;
  readonly type: QuestionType;
  readonly difficulty: DifficultyLevel;
  readonly status: QuestionStatus;
  readonly defaultPoints: number;
  readonly prompt: string;
  readonly explanation?: string | null;
  readonly hint?: string | null;
  readonly currentVersionNumber: number;
  readonly options: readonly QuestionOptionItem[];
  readonly topicId?: string | null;
  readonly unitId?: string | null;
  readonly gradeId?: string | null;
  readonly subjectId?: string | null;
  readonly objectiveId?: string | null;
  readonly examContextId?: string | null;
  readonly examYear?: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface QuestionDetailItem extends QuestionListItem {
  readonly versions: readonly QuestionVersionItem[];
  readonly topic?: {
    readonly id: string;
    readonly title: string;
    readonly code: string;
  } | null;
  readonly objective?: {
    readonly id: string;
    readonly description: string;
    readonly code: string;
  } | null;
  readonly examContext?: {
    readonly id: string;
    readonly name: string;
    readonly code: string;
    readonly scope: ExamScope;
  } | null;
}

export interface CreateQuestionDto {
  readonly code?: string;
  readonly type: QuestionType;
  readonly difficulty?: DifficultyLevel;
  readonly defaultPoints?: number;
  readonly prompt: string;
  readonly explanation?: string | null;
  readonly hint?: string | null;
  readonly options?: readonly QuestionOptionItem[];
  readonly subjectId?: string | null;
  readonly gradeId?: string | null;
  readonly unitId?: string | null;
  readonly topicId?: string | null;
  readonly objectiveId?: string | null;
  readonly examContextId?: string | null;
  readonly examYear?: number | null;
  readonly tags?: readonly string[];
}

export interface UpdateQuestionDto {
  readonly type?: QuestionType;
  readonly status?: QuestionStatus;
  readonly difficulty?: DifficultyLevel;
  readonly defaultPoints?: number;
  readonly prompt?: string;
  readonly explanation?: string | null;
  readonly hint?: string | null;
  readonly options?: readonly QuestionOptionItem[];
  readonly subjectId?: string | null;
  readonly gradeId?: string | null;
  readonly unitId?: string | null;
  readonly topicId?: string | null;
  readonly objectiveId?: string | null;
  readonly examContextId?: string | null;
  readonly examYear?: number | null;
  readonly changeLog?: string;
}

export interface QuestionFilters {
  readonly search?: string;
  readonly type?: QuestionType;
  readonly difficulty?: DifficultyLevel;
  readonly status?: QuestionStatus;
  readonly topicId?: string;
  readonly objectiveId?: string;
  readonly examContextId?: string;
  readonly examYear?: number;
  readonly page?: number;
  readonly limit?: number;
}

export interface QuestionBankItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string | null;
  readonly status: QuestionBankStatus;
  readonly subjectId?: string | null;
  readonly gradeId?: string | null;
  readonly examContextId?: string | null;
  readonly questionCount: number;
  readonly subject?: {
    readonly id: string;
    readonly name: string;
    readonly code: string;
  } | null;
  readonly grade?: {
    readonly id: string;
    readonly name: string;
    readonly level: number;
  } | null;
  readonly examContexts?: readonly {
    readonly id: string;
    readonly name: string;
    readonly code: string;
    readonly scope: ExamScope;
    readonly year?: number | null;
    readonly gradeId?: string | null;
    readonly subjectId?: string | null;
    readonly grade?: {
      readonly id: string;
      readonly name: string;
      readonly level: number;
    } | null;
    readonly subject?: {
      readonly id: string;
      readonly name: string;
      readonly code: string;
    } | null;
  }[];
  readonly createdBy?: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
  } | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface QuestionBankDetailItem extends QuestionBankItem {
  readonly questions: readonly QuestionListItem[];
}

export interface CreateQuestionBankDto {
  readonly code?: string;
  readonly name: string;
  readonly description?: string | null;
  readonly subjectId?: string | null;
  readonly gradeId?: string | null;
  readonly examContextId?: string | null;
  readonly status?: QuestionBankStatus;
}

export interface UpdateQuestionBankDto {
  readonly name?: string;
  readonly description?: string | null;
  readonly subjectId?: string | null;
  readonly gradeId?: string | null;
  readonly examContextId?: string | null;
  readonly status?: QuestionBankStatus;
}

export interface QuestionBankFilters {
  readonly search?: string;
  readonly subjectId?: string;
  readonly gradeId?: string;
  readonly status?: QuestionBankStatus;
  readonly examContextId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface ExamContextItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string | null;
  readonly scope: ExamScope;
  readonly status: ExamContextStatus;
  readonly year?: number | null;
  readonly examYear?: number | null;
  readonly questionBankCount?: number;
  readonly questionCount?: number;
  readonly assessmentCount?: number;
  readonly _count?: {
    readonly questionBanks?: number;
    readonly assessments?: number;
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateExamContextDto {
  readonly code?: string;
  readonly name: string;
  readonly description?: string | null;
  readonly scope: ExamScope;
  readonly status?: ExamContextStatus;
  readonly year?: number | null;
}

export interface UpdateExamContextDto {
  readonly name?: string;
  readonly description?: string | null;
  readonly scope?: ExamScope;
  readonly status?: ExamContextStatus;
  readonly year?: number | null;
}

export interface ExamContextFilters {
  readonly search?: string;
  readonly scope?: ExamScope;
  readonly status?: ExamContextStatus;
  readonly year?: number;
  readonly page?: number;
  readonly limit?: number;
}

export interface ExtractedQuestionDraft {
  readonly type: QuestionType;
  readonly prompt: string;
  readonly difficulty: DifficultyLevel;
  readonly defaultPoints: number;
  readonly explanation?: string | null;
  readonly hint?: string | null;
  readonly options?: readonly QuestionOptionItem[];
  readonly rawText?: string;
  readonly confidence?: number;
}

export interface QuestionUploadResponse {
  readonly uploadId: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly pageCount: number;
  readonly questionsExtracted: number;
  readonly extractionStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  readonly extractedQuestions: readonly ExtractedQuestionDraft[];
}

export interface ConfirmUploadDto {
  readonly questions: readonly ExtractedQuestionDraft[];
}

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly meta: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
  };
}
