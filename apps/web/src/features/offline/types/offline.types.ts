export type OutboxActionType =
  | "SAVE_ASSESSMENT_ANSWER"
  | "BATCH_SAVE_ASSESSMENT_ANSWERS"
  | "SUBMIT_ASSESSMENT_ATTEMPT"
  | "SAVE_CONTENT_PROGRESS"
  | "TOGGLE_BOOKMARK"
  | "SAVE_PRACTICE_SESSION"
  | "MANUAL_GRADE_ATTEMPT";

export type OutboxItemStatus = "PENDING" | "SYNCING" | "FAILED";

export type ConflictResolutionStrategy =
  | "LAST_WRITE_WINS"
  | "MONOTONIC_PROGRESS"
  | "IMMUTABLE_SUBMIT";

export interface OutboxQueueItem {
  id: string;
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
  createdAt: number;
  attempts: number;
  status: OutboxItemStatus;
  lastError?: string;
}

export interface CachedAssessmentAttempt {
  attemptId: string;
  assessmentId: string;
  tenantId: string;
  userId: string;
  answers: Record<string, unknown>;
  timeLimitMinutes?: number | null;
  startedAt: string;
  updatedAt: number;
}

export interface CachedContentProgress {
  id: string;
  contentId: string;
  tenantId: string;
  userId: string;
  lastPositionSeconds: number;
  durationSeconds: number;
  progressPercent: number;
  isCompleted: boolean;
  updatedAt: number;
}

export interface CachedPracticeSession {
  id: string;
  bankId: string;
  tenantId: string;
  userId: string;
  currentIndex: number;
  selectedAnswers: Record<string, unknown>;
  flaggedQuestionIds: string[];
  secondsElapsed: number;
  isFinished: boolean;
  updatedAt: number;
}

export interface CachedBookmark {
  id: string;
  tenantId: string;
  studentId: string;
  targetType: "QUESTION" | "TOPIC" | "LEARNING_CONTENT";
  targetId: string;
  note?: string | null;
  isBookmarked: boolean;
  updatedAt: number;
}

export interface OfflineSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncTimestamp?: number;
}
