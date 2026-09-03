export type CurriculumScope = "TENANT" | "SYSTEM";
export type CurriculumStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type CurriculumVersionStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface CurriculumVersionItem {
  readonly id: string;
  readonly curriculumId: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly effectiveFrom: string | null;
  readonly effectiveTo: string | null;
  readonly status: CurriculumVersionStatus;
  readonly externalId: string | null;
  readonly subjectCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CurriculumItem {
  readonly id: string;
  readonly tenantId: string | null;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly scope: CurriculumScope;
  readonly status: CurriculumStatus;
  readonly authorityName: string | null;
  readonly externalId: string | null;
  readonly versionCount: number;
  readonly activeVersionId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CurriculumDetailItem extends CurriculumItem {
  readonly versions: readonly CurriculumVersionItem[];
}

export interface CreateCurriculumPayload {
  readonly code?: string;
  readonly name: string;
  readonly description?: string | null;
  readonly scope?: CurriculumScope;
  readonly authorityName?: string | null;
  readonly externalId?: string | null;
  readonly initialVersionCode?: string;
  readonly initialVersionName?: string;
}

export interface UpdateCurriculumPayload {
  readonly name?: string;
  readonly description?: string | null;
  readonly authorityName?: string | null;
  readonly externalId?: string | null;
}

export interface CreateCurriculumVersionPayload {
  readonly code?: string;
  readonly name?: string;
  readonly description?: string | null;
  readonly effectiveFrom?: string | null;
  readonly effectiveTo?: string | null;
  readonly externalId?: string | null;
}

export interface UpdateCurriculumVersionPayload {
  readonly name?: string;
  readonly description?: string | null;
  readonly effectiveFrom?: string | null;
  readonly effectiveTo?: string | null;
  readonly externalId?: string | null;
}

export interface CurriculumFilters {
  readonly search?: string;
  readonly scope?: CurriculumScope;
  readonly status?: CurriculumStatus;
  readonly version?: string;
  readonly page?: number;
  readonly limit?: number;
}
