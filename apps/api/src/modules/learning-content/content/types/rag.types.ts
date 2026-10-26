export interface IngestContentParams {
  readonly attachmentIds?: string[];
}

export interface IngestionResult {
  readonly contentId: string;
  readonly chunksCreated: number;
  readonly tokensIndexed: number;
  readonly pagesProcessed: number;
  readonly strategy: "semantic_boundary" | "fixed_sliding";
  readonly attachmentsProcessed: number;
  readonly cleaningStats: {
    readonly originalCharCount: number;
    readonly cleanedCharCount: number;
    readonly removedBoilerplateLines: number;
    readonly pagesSkipped: number;
  };
}

export interface HybridSearchParams {
  readonly query: string;
  readonly topicId?: string;
  readonly subjectId?: string;
  readonly gradeId?: string;
  readonly limit?: number;
}

export interface HybridSearchResult {
  readonly id: string;
  readonly contentId: string;
  readonly chunkIndex: number;
  readonly text: string;
  readonly score: number;
  readonly metadata?: unknown;
}
