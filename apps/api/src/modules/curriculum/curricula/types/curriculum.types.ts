import {
  CurriculumStatusType,
  CurriculumVersionStatusType,
  CurriculumScopeType,
} from "../../../../shared/constants/curriculum.constants.js";

export interface CurriculumVersionRecord {
  readonly id: string;
  readonly curriculumId: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly effectiveFrom: Date | null;
  readonly effectiveTo: Date | null;
  readonly status: CurriculumVersionStatusType;
  readonly externalId: string | null;
  readonly subjectCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CurriculumRecord {
  readonly id: string;
  readonly tenantId: string | null;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly scope: CurriculumScopeType;
  readonly status: CurriculumStatusType;
  readonly authorityName: string | null;
  readonly externalId: string | null;
  readonly versionCount: number;
  readonly activeVersionId: string | null;
  readonly activeVersionName?: string | null;
  readonly versionNames?: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CurriculumDetailRecord extends CurriculumRecord {
  readonly versions: readonly CurriculumVersionRecord[];
}

export interface CreateCurriculumInput {
  readonly code?: string;
  readonly name: string;
  readonly description?: string | null;
  readonly scope?: CurriculumScopeType;
  readonly authorityName?: string | null;
  readonly externalId?: string | null;
  readonly initialVersionCode?: string;
  readonly initialVersionName?: string;
}

export interface UpdateCurriculumInput {
  readonly name?: string;
  readonly description?: string | null;
  readonly authorityName?: string | null;
  readonly externalId?: string | null;
}

export interface CreateCurriculumVersionInput {
  readonly code?: string;
  readonly name?: string;
  readonly description?: string | null;
  readonly effectiveFrom?: Date | string | null;
  readonly effectiveTo?: Date | string | null;
  readonly externalId?: string | null;
}

export interface UpdateCurriculumVersionInput {
  readonly name?: string;
  readonly description?: string | null;
  readonly effectiveFrom?: Date | string | null;
  readonly effectiveTo?: Date | string | null;
  readonly externalId?: string | null;
}

export interface CurriculumFilterParams {
  readonly tenantId?: string;
  readonly search?: string;
  readonly scope?: CurriculumScopeType;
  readonly status?: CurriculumStatusType;
  readonly version?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface PaginatedCurriculaResult {
  readonly data: readonly CurriculumRecord[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}
