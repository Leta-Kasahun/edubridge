import { offlineDb } from "../db/offline-db";
import {
  OutboxQueueItem,
  OutboxActionType,
  ConflictResolutionStrategy,
} from "../types/offline.types";

export interface EnqueueOutboxParams {
  tenantId: string;
  userId: string;
  targetEntityKey: string;
  actionType: OutboxActionType;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  payload: Record<string, unknown>;
  idempotencyKey: string;
  clientTimestamp: number;
  conflictStrategy: ConflictResolutionStrategy;
}

export const outboxRepository = {
  async enqueue(params: EnqueueOutboxParams): Promise<OutboxQueueItem> {
    return offlineDb.transaction("rw", offlineDb.outbox, async () => {
      const existing = await offlineDb.outbox
        .where("[tenantId+userId]")
        .equals([params.tenantId, params.userId])
        .filter(
          (item) =>
            item.targetEntityKey === params.targetEntityKey &&
            item.status === "PENDING"
        )
        .first();

      if (existing) {
        const updated: OutboxQueueItem = {
          ...existing,
          payload: params.payload,
          clientTimestamp: params.clientTimestamp,
          idempotencyKey: params.idempotencyKey,
          createdAt: Date.now(),
        };
        await offlineDb.outbox.put(updated);
        return updated;
      }

      const newItem: OutboxQueueItem = {
        id: crypto.randomUUID(),
        ...params,
        createdAt: Date.now(),
        attempts: 0,
        status: "PENDING",
      };

      await offlineDb.outbox.add(newItem);
      return newItem;
    });
  },

  async getPending(
    tenantId: string,
    userId: string
  ): Promise<OutboxQueueItem[]> {
    return offlineDb.outbox
      .where("[tenantId+userId]")
      .equals([tenantId, userId])
      .filter((item) => item.status === "PENDING")
      .sortBy("createdAt");
  },

  async markSyncing(id: string): Promise<void> {
    await offlineDb.outbox.update(id, { status: "SYNCING" });
  },

  async markFailed(
    id: string,
    error: string,
    isPermanent: boolean
  ): Promise<void> {
    const item = await offlineDb.outbox.get(id);
    if (!item) return;

    await offlineDb.outbox.update(id, {
      status: isPermanent ? "FAILED" : "PENDING",
      attempts: item.attempts + 1,
      lastError: error,
    });
  },

  async remove(id: string): Promise<void> {
    await offlineDb.outbox.delete(id);
  },

  async getStatusCounts(
    tenantId: string,
    userId: string
  ): Promise<{ pending: number; failed: number }> {
    const items = await offlineDb.outbox
      .where("[tenantId+userId]")
      .equals([tenantId, userId])
      .toArray();

    let pending = 0;
    let failed = 0;

    for (const item of items) {
      if (item.status === "PENDING" || item.status === "SYNCING") {
        pending++;
      } else if (item.status === "FAILED") {
        failed++;
      }
    }

    return { pending, failed };
  },

  async clearUserQueue(tenantId: string, userId: string): Promise<void> {
    const keys = await offlineDb.outbox
      .where("[tenantId+userId]")
      .equals([tenantId, userId])
      .primaryKeys();

    await offlineDb.outbox.bulkDelete(keys);
  },
};
