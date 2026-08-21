export type LookupCategory =
  | "POLICY"
  | "FEATURE"
  | "SETTING"
  | "SECURITY"
  | "NOTIFICATION"
  | "INTEGRATION"
  | "TAG"
  | "CUSTOM"
  | (string & {});

export interface Lookup<T = unknown> {
  readonly id: string;
  readonly tenantId?: string | null;
  readonly category: string;
  readonly key: string;
  readonly value: T;
  readonly description?: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateLookupPayload<T = unknown> {
  readonly category: string;
  readonly key: string;
  readonly value: T;
  readonly description?: string | null;
  readonly isActive?: boolean;
}

export interface UpdateLookupPayload<T = unknown> {
  readonly category?: string;
  readonly key?: string;
  readonly value?: T;
  readonly description?: string | null;
  readonly isActive?: boolean;
}
