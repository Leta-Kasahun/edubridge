export interface ParsedCurriculumRow {
  readonly gradeLevel: number;
  readonly subjectCode: string;
  readonly unitCode: string;
  readonly unitTitle: string;
  readonly topicCode: string;
  readonly topicTitle: string;
  readonly objectiveCode: string;
  readonly objectiveStatement: string;
  readonly externalId?: string | null;
}

export interface CurriculumImportRowValidation {
  readonly rowIndex: number;
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly rowData: ParsedCurriculumRow;
}

export interface CurriculumImportPreview {
  readonly totalRows: number;
  readonly validRowsCount: number;
  readonly invalidRowsCount: number;
  readonly uniqueSubjectsCount: number;
  readonly uniqueUnitsCount: number;
  readonly uniqueTopicsCount: number;
  readonly uniqueObjectivesCount: number;
  readonly validationIssues: readonly CurriculumImportRowValidation[];
}

export interface CurriculumImportCommitInput {
  readonly curriculumVersionId: string;
  readonly rows: readonly ParsedCurriculumRow[];
}

export interface CurriculumImportCommitResult {
  readonly curriculumVersionId: string;
  readonly createdSubjectsCount: number;
  readonly createdUnitsCount: number;
  readonly createdTopicsCount: number;
  readonly createdObjectivesCount: number;
  readonly committedAt: Date;
}
