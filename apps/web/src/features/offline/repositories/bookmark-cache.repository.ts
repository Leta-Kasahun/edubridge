import { offlineDb } from "../db/offline-db";
import { CachedBookmark } from "../types/offline.types";

export const bookmarkCacheRepository = {
  async getBookmark(
    tenantId: string,
    studentId: string,
    targetType: "QUESTION" | "TOPIC" | "LEARNING_CONTENT",
    targetId: string
  ): Promise<CachedBookmark | undefined> {
    return offlineDb.cachedBookmarks
      .where("[tenantId+studentId]")
      .equals([tenantId, studentId])
      .filter((item) => item.targetType === targetType && item.targetId === targetId)
      .first();
  },

  async toggleLocal(
    tenantId: string,
    studentId: string,
    targetType: "QUESTION" | "TOPIC" | "LEARNING_CONTENT",
    targetId: string,
    note?: string | null
  ): Promise<boolean> {
    return offlineDb.transaction("rw", offlineDb.cachedBookmarks, async () => {
      const existing = await offlineDb.cachedBookmarks
        .where("[tenantId+studentId]")
        .equals([tenantId, studentId])
        .filter((item) => item.targetType === targetType && item.targetId === targetId)
        .first();

      if (existing) {
        const nextState = !existing.isBookmarked;
        await offlineDb.cachedBookmarks.update(existing.id, {
          isBookmarked: nextState,
          note: note !== undefined ? note : existing.note,
          updatedAt: Date.now(),
        });
        return nextState;
      }

      const newBookmark: CachedBookmark = {
        id: crypto.randomUUID(),
        tenantId,
        studentId,
        targetType,
        targetId,
        note,
        isBookmarked: true,
        updatedAt: Date.now(),
      };

      await offlineDb.cachedBookmarks.add(newBookmark);
      return true;
    });
  },

  async checkLocal(
    tenantId: string,
    studentId: string,
    targetType: "QUESTION" | "TOPIC" | "LEARNING_CONTENT",
    targetIds: readonly string[]
  ): Promise<string[]> {
    const targetSet = new Set(targetIds);
    const records = await offlineDb.cachedBookmarks
      .where("[tenantId+studentId]")
      .equals([tenantId, studentId])
      .filter(
        (item) =>
          item.targetType === targetType &&
          targetSet.has(item.targetId) &&
          item.isBookmarked
      )
      .toArray();

    return records.map((r) => r.targetId);
  },

  async cacheBatch(bookmarks: CachedBookmark[]): Promise<void> {
    await offlineDb.cachedBookmarks.bulkPut(bookmarks);
  },
};
