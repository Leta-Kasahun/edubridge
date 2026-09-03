import { ContentType } from "./content.types";

export type ImportStep = "UPLOAD" | "PREVIEW" | "RESULT";

export interface RawContentImportRow {
  readonly title: string;
  readonly type: string;
  readonly description?: string | null;
  readonly topicCode: string;
  readonly objectiveCode?: string | null;
  readonly initialText?: string | null;
  readonly resourceUrl?: string | null;
}

export interface ValidatedContentImportRow {
  readonly rowNumber: number;
  readonly title: string;
  readonly type: ContentType;
  readonly description?: string | null;
  readonly topicCode: string;
  readonly topicId?: string;
  readonly objectiveCode?: string | null;
  readonly objectiveId?: string;
  readonly initialText?: string | null;
  readonly resourceUrl?: string | null;
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export interface ContentImportPreview {
  readonly totalRows: number;
  readonly validRowsCount: number;
  readonly invalidRowsCount: number;
  readonly rows: readonly ValidatedContentImportRow[];
}

export interface ContentImportCommitPayload {
  readonly rows: readonly ValidatedContentImportRow[];
  readonly curriculumVersionId?: string;
}

export interface ContentImportCommitResult {
  readonly totalProcessed: number;
  readonly createdCount: number;
  readonly skippedCount: number;
  readonly createdContentIds: readonly string[];
}
