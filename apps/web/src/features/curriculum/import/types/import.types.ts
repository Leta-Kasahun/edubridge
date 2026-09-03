export interface RawCurriculumImportRow {
  readonly gradeLevel: number | string;
  readonly subjectName: string;
  readonly unitTitle: string;
  readonly unitCode?: string | null;
  readonly unitDescription?: string | null;
  readonly topicTitle: string;
  readonly topicCode?: string | null;
  readonly topicDescription?: string | null;
  readonly objectiveStatement: string;
  readonly objectiveCode?: string | null;
  readonly objectiveDescription?: string | null;
  readonly externalId?: string | null;
}

export type ImportIssueSeverity = "ERROR" | "WARNING";

export interface CurriculumImportIssue {
  readonly rowNumber: number;
  readonly field: string;
  readonly message: string;
  readonly severity: ImportIssueSeverity;
}

export interface ValidatedCurriculumImportRow {
  readonly rowNumber: number;
  readonly gradeLevel: number;
  readonly gradeId: string | null;
  readonly subjectName: string;
  readonly subjectId: string | null;
  readonly subjectCode: string | null;
  readonly unitTitle: string;
  readonly unitCode: string;
  readonly unitDescription: string | null;
  readonly topicTitle: string;
  readonly topicCode: string;
  readonly topicDescription: string | null;
  readonly objectiveStatement: string;
  readonly objectiveCode: string;
  readonly objectiveDescription: string | null;
  readonly externalId: string | null;
  readonly isValid: boolean;
  readonly isUnitNew: boolean;
  readonly isTopicNew: boolean;
  readonly isObjectiveNew: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface CurriculumImportPreview {
  readonly curriculumVersionId: string;
  readonly versionCode: string;
  readonly versionName: string;
  readonly totalRows: number;
  readonly validRowsCount: number;
  readonly invalidRowsCount: number;
  readonly uniqueSubjectsCount: number;
  readonly uniqueUnitsCount: number;
  readonly uniqueTopicsCount: number;
  readonly uniqueObjectivesCount: number;
  readonly rows: readonly ValidatedCurriculumImportRow[];
  readonly issues: readonly CurriculumImportIssue[];
  readonly canCommit: boolean;
}

export interface CurriculumImportCommitPayload {
  readonly curriculumVersionId: string;
  readonly csvContent?: string;
  readonly rows?: readonly RawCurriculumImportRow[];
}

export interface CurriculumImportCommitResult {
  readonly curriculumVersionId: string;
  readonly totalProcessedRows: number;
  readonly createdSubjectsCount: number;
  readonly createdUnitsCount: number;
  readonly createdTopicsCount: number;
  readonly createdObjectivesCount: number;
  readonly skippedDuplicatesCount: number;
  readonly committedAt: string;
}

export type ImportStep = "UPLOAD" | "PREVIEW" | "SUCCESS";
