import { offlineDb } from "../db/offline-db";
import { CachedAssessmentAttempt } from "../types/offline.types";

export const attemptCacheRepository = {
  async getAttempt(
    attemptId: string,
    tenantId: string,
    userId: string
  ): Promise<CachedAssessmentAttempt | undefined> {
    const item = await offlineDb.cachedAttempts.get(attemptId);
    if (!item || item.tenantId !== tenantId || item.userId !== userId) {
      return undefined;
    }
    return item;
  },

  async saveAttempt(attempt: CachedAssessmentAttempt): Promise<void> {
    await offlineDb.cachedAttempts.put(attempt);
  },

  async saveAnswer(
    attemptId: string,
    tenantId: string,
    userId: string,
    questionVersionId: string,
    answer: unknown
  ): Promise<void> {
    await offlineDb.transaction("rw", offlineDb.cachedAttempts, async () => {
      const existing = await offlineDb.cachedAttempts.get(attemptId);
      if (!existing || existing.tenantId !== tenantId || existing.userId !== userId) {
        return;
      }

      const updatedAnswers = {
        ...existing.answers,
        [questionVersionId]: answer,
      };

      await offlineDb.cachedAttempts.put({
        ...existing,
        answers: updatedAnswers,
        updatedAt: Date.now(),
      });
    });
  },

  async removeAttempt(attemptId: string): Promise<void> {
    await offlineDb.cachedAttempts.delete(attemptId);
  },

  async clearUserAttempts(tenantId: string, userId: string): Promise<void> {
    const keys = await offlineDb.cachedAttempts
      .where("[tenantId+userId]")
      .equals([tenantId, userId])
      .primaryKeys();

    await offlineDb.cachedAttempts.bulkDelete(keys);
  },
};
