import { offlineDb } from "../db/offline-db";
import { CachedContentProgress } from "../types/offline.types";

export interface SaveLocalContentProgressInput {
  readonly lastPositionSeconds: number;
  readonly durationSeconds: number;
  readonly progressPercent: number;
  readonly isCompleted?: boolean;
}

export const contentProgressCacheRepository = {
  async getProgress(
    tenantId: string,
    userId: string,
    contentId: string
  ): Promise<CachedContentProgress | undefined> {
    return offlineDb.cachedContentProgress
      .where("[tenantId+userId]")
      .equals([tenantId, userId])
      .filter((item) => item.contentId === contentId)
      .first();
  },

  async saveProgressLocal(
    tenantId: string,
    userId: string,
    contentId: string,
    input: SaveLocalContentProgressInput
  ): Promise<CachedContentProgress> {
    return offlineDb.transaction("rw", offlineDb.cachedContentProgress, async () => {
      const existing = await offlineDb.cachedContentProgress
        .where("[tenantId+userId]")
        .equals([tenantId, userId])
        .filter((item) => item.contentId === contentId)
        .first();

      const computedProgressPercent = existing
        ? Math.max(existing.progressPercent, input.progressPercent)
        : input.progressPercent;

      const computedIsCompleted = existing
        ? existing.isCompleted || Boolean(input.isCompleted) || computedProgressPercent >= 100
        : Boolean(input.isCompleted) || computedProgressPercent >= 100;

      const record: CachedContentProgress = {
        id: existing?.id ?? crypto.randomUUID(),
        contentId,
        tenantId,
        userId,
        lastPositionSeconds: input.lastPositionSeconds,
        durationSeconds: input.durationSeconds,
        progressPercent: computedProgressPercent,
        isCompleted: computedIsCompleted,
        updatedAt: Date.now(),
      };

      await offlineDb.cachedContentProgress.put(record);
      return record;
    });
  },

  async clearUserProgress(tenantId: string, userId: string): Promise<void> {
    const keys = await offlineDb.cachedContentProgress
      .where("[tenantId+userId]")
      .equals([tenantId, userId])
      .primaryKeys();

    await offlineDb.cachedContentProgress.bulkDelete(keys);
  },
};
