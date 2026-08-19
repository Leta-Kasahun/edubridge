import { redis, RedisKeys } from "../../../lib/redis.js";
import { getTenantContext } from "../../../lib/prisma.js";
import { ConflictError, NotFoundError, BadRequestError } from "../../../shared/exceptions/index.js";
import { LookupRepository, lookupRepository } from "../repository/lookup.repository.js";
import { CreateLookupInput, UpdateLookupInput } from "../types/lookup.types.js";

export class LookupService {
  constructor(private readonly repository: LookupRepository = lookupRepository) {}

  private getTenantId(): string {
    const tenantId = getTenantContext()?.tenantId;
    if (!tenantId) {
      throw new BadRequestError("Tenant context is required", "TENANT_REQUIRED");
    }
    return tenantId;
  }

  private async invalidateCache(category?: string, key?: string): Promise<void> {
    const tenantId = this.getTenantId();
    const keys: string[] = [];

    if (category && key) {
      keys.push(RedisKeys.tenant.lookup(tenantId, category, key));
    }
    if (category) {
      keys.push(RedisKeys.tenant.categoryLookups(tenantId, category));
    }
    if (!category && !key) {
      try {
        const pattern = RedisKeys.patterns.tenantLookups(tenantId);
        const matchKeys = await redis.keys(pattern);
        if (matchKeys.length > 0) {
          keys.push(...matchKeys);
        }
      } catch {}
    }

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async getAllByCategory(category: string) {
    const tenantId = this.getTenantId();
    const cacheKey = RedisKeys.tenant.categoryLookups(tenantId, category);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const lookups = await this.repository.findAllByCategory(category);
    await redis.set(cacheKey, JSON.stringify(lookups), "EX", 3600);
    return lookups;
  }

  async getByCategoryAndKey(category: string, key: string) {
    const tenantId = this.getTenantId();
    const cacheKey = RedisKeys.tenant.lookup(tenantId, category, key);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const lookup = await this.repository.findByCategoryAndKey(category, key);
    if (!lookup) {
      throw new NotFoundError("Lookup not found", "LOOKUP_NOT_FOUND");
    }

    await redis.set(cacheKey, JSON.stringify(lookup), "EX", 3600);
    return lookup;
  }

  async createLookup(data: CreateLookupInput) {
    const existing = await this.repository.findByCategoryAndKey(data.category, data.key);
    if (existing) {
      throw new ConflictError("Lookup with this category and key already exists", "LOOKUP_ALREADY_EXISTS");
    }

    const created = await this.repository.create(data);
    await this.invalidateCache(data.category, data.key);
    return created;
  }

  async updateLookup(id: string, data: UpdateLookupInput) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Lookup not found", "LOOKUP_NOT_FOUND");
    }

    if (data.key && data.key !== existing.key) {
      const duplicate = await this.repository.findByCategoryAndKey(
        data.category || existing.category,
        data.key
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError("Lookup with this category and key already exists", "LOOKUP_ALREADY_EXISTS");
      }
    }

    const updated = await this.repository.update(id, data);
    await this.invalidateCache(existing.category, existing.key);
    if (data.category && data.category !== existing.category) {
      await this.invalidateCache(data.category, data.key || existing.key);
    }
    return updated;
  }

  async deleteLookup(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Lookup not found", "LOOKUP_NOT_FOUND");
    }

    const deleted = await this.repository.delete(id);
    await this.invalidateCache(existing.category, existing.key);
    return deleted;
  }

  async getFeatureFlag(key: string) {
    try {
      const lookup = await this.getByCategoryAndKey("FEATURE", key);
      return lookup.value;
    } catch {
      return null;
    }
  }

  async setFeatureFlag(key: string, value: unknown, description?: string | null) {
    const existing = await this.repository.findByCategoryAndKey("FEATURE", key);
    if (existing) {
      return this.updateLookup(existing.id, { value, description });
    }
    return this.createLookup({ category: "FEATURE", key, value, description });
  }

  async getSetting(key: string) {
    try {
      const lookup = await this.getByCategoryAndKey("SETTING", key);
      return lookup.value;
    } catch {
      return null;
    }
  }

  async setSetting(key: string, value: unknown, description?: string | null) {
    const existing = await this.repository.findByCategoryAndKey("SETTING", key);
    if (existing) {
      return this.updateLookup(existing.id, { value, description });
    }
    return this.createLookup({ category: "SETTING", key, value, description });
  }
}

export const lookupService = new LookupService();
