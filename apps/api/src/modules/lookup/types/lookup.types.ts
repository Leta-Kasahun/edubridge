export interface Lookup {
  id?: string;
  tenantId?: string;
  category: string;
  key: string;
  value: unknown;
  description?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLookupInput {
  category: string;
  key: string;
  value: unknown;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateLookupInput {
  category?: string;
  key?: string;
  value?: unknown;
  description?: string | null;
  isActive?: boolean;
}
