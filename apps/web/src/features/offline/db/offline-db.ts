import Dexie, { type Table } from "dexie";
import {
  OutboxQueueItem,
  CachedAssessmentAttempt,
  CachedContentProgress,
  CachedPracticeSession,
  CachedBookmark,
} from "../types/offline.types";

export class EduBridgeLocalDatabase extends Dexie {
  outbox!: Table<OutboxQueueItem, string>;
  cachedAttempts!: Table<CachedAssessmentAttempt, string>;
  cachedContentProgress!: Table<CachedContentProgress, string>;
  cachedPracticeSessions!: Table<CachedPracticeSession, string>;
  cachedBookmarks!: Table<CachedBookmark, string>;

  constructor() {
    super("edubridge_local_db");
    this.version(1).stores({
      outbox: "id, [tenantId+userId], targetEntityKey, status, createdAt, actionType",
      cachedAttempts: "attemptId, assessmentId, [tenantId+userId], updatedAt",
      cachedContentProgress: "id, [tenantId+userId], contentId, updatedAt",
      cachedPracticeSessions: "id, [tenantId+userId], bankId, updatedAt",
      cachedBookmarks: "id, [tenantId+studentId], [targetType+targetId], updatedAt",
    });
  }
}

export const offlineDb = new EduBridgeLocalDatabase();
