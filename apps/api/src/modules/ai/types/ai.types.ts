export type AiJobType = "CONTENT_GENERATION" | "QUESTION_GENERATION";
export type AiJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface AiJobDto {
  readonly id: string;
  readonly tenantId: string;
  readonly jobType: AiJobType;
  readonly status: AiJobStatus;
  readonly requestedById: string;
  readonly inputParams: unknown;
  readonly outputSummary: unknown;
  readonly model: string;
  readonly promptTokens: number | null;
  readonly outputTokens: number | null;
  readonly errorMessage: string | null;
  readonly createdAt: Date;
  readonly completedAt: Date | null;
}

export interface GeneratedQuestionOption {
  readonly optionKey: "A" | "B" | "C" | "D";
  readonly optionText: string;
  readonly isCorrect: boolean;
}

export interface GeneratedQuestion {
  readonly questionText: string;
  readonly type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "NUMERIC";
  readonly difficulty: "EASY" | "MEDIUM" | "HARD";
  readonly points: number;
  readonly explanation: string;
  readonly correctAnswer?: string;
  readonly options?: readonly GeneratedQuestionOption[];
  readonly targetedObjectiveIndex?: number;
}

export interface QuestionGenerationResult {
  readonly questions: readonly GeneratedQuestion[];
  readonly generationNotes?: string;
}

export interface GeneratedContentSection {
  readonly heading: string;
  readonly objectiveIndex?: number;
  readonly content: string;
}

export interface GeneratedContentResult {
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly sections: readonly GeneratedContentSection[];
  readonly generationNotes?: string;
}
