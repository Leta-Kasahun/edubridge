import axios from "axios";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/stores/auth.store";
import { outboxRepository } from "../repositories/outbox.repository";
import { OfflineSyncStatus } from "../types/offline.types";

type SyncSubscriber = (status: OfflineSyncStatus) => void;

class SyncEngine {
  private isDraining = false;
  private subscribers = new Set<SyncSubscriber>();
  private lastSyncTimestamp?: number;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.drain();
      });

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.drain();
        }
      });
    }
  }

  public subscribe(callback: SyncSubscriber): () => void {
    this.subscribers.add(callback);
    this.notify();
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public async drain(): Promise<{ synced: number; failed: number }> {
    if (this.isDraining) {
      return { synced: 0, failed: 0 };
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.notify();
      return { synced: 0, failed: 0 };
    }

    const authState = useAuthStore.getState();
    const tenantId = authState.tenantId;
    const userId = authState.user?.id;

    if (!tenantId || !userId || !authState.isAuthenticated) {
      return { synced: 0, failed: 0 };
    }

    this.isDraining = true;
    this.notify();

    let synced = 0;
    let failed = 0;

    try {
      const pendingItems = await outboxRepository.getPending(tenantId, userId);

      for (const item of pendingItems) {
        if (item.attempts >= 5) {
          await outboxRepository.markFailed(
            item.id,
            item.lastError || "Maximum retry attempts exceeded",
            true
          );
          failed++;
          continue;
        }

        await outboxRepository.markSyncing(item.id);
        this.notify();

        try {
          await apiClient.request({
            method: item.method,
            url: item.endpoint,
            data: item.payload,
            headers: {
              "X-Idempotency-Key": item.idempotencyKey,
              "X-Client-Timestamp": item.clientTimestamp.toString(),
            },
          });

          await outboxRepository.remove(item.id);
          synced++;
        } catch (error: unknown) {
          failed++;
          let errorMessage = "Sync failed";
          let isPermanent = false;

          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data as
              | { message?: string; error?: { message?: string } }
              | undefined;

            errorMessage =
              data?.message ||
              data?.error?.message ||
              error.message;

            if (
              status !== undefined &&
              status >= 400 &&
              status < 500 &&
              status !== 408 &&
              status !== 429
            ) {
              isPermanent = true;
            }
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          await outboxRepository.markFailed(item.id, errorMessage, isPermanent);

          if (!isPermanent) {
            break;
          }
        }
      }

      this.lastSyncTimestamp = Date.now();
    } finally {
      this.isDraining = false;
      this.notify();
    }

    return { synced, failed };
  }

  public async getStatus(): Promise<OfflineSyncStatus> {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const authState = useAuthStore.getState();
    const tenantId = authState.tenantId;
    const userId = authState.user?.id;

    if (!tenantId || !userId) {
      return {
        isOnline,
        isSyncing: false,
        pendingCount: 0,
        failedCount: 0,
        lastSyncTimestamp: this.lastSyncTimestamp,
      };
    }

    const { pending, failed } = await outboxRepository.getStatusCounts(
      tenantId,
      userId
    );

    return {
      isOnline,
      isSyncing: this.isDraining,
      pendingCount: pending,
      failedCount: failed,
      lastSyncTimestamp: this.lastSyncTimestamp,
    };
  }

  private async notify(): Promise<void> {
    if (this.subscribers.size === 0) return;
    const status = await this.getStatus();
    for (const callback of this.subscribers) {
      callback(status);
    }
  }
}

export const syncEngine = new SyncEngine();
