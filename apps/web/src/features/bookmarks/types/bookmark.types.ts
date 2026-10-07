export type BookmarkTargetType = "QUESTION" | "TOPIC" | "LEARNING_CONTENT";

export interface BookmarkedQuestionOption {
  readonly id?: string;
  readonly optionKey: string;
  readonly optionText: string;
  readonly orderIndex: number;
  readonly isCorrect?: boolean;
}

export interface BookmarkedQuestionDetails {
  readonly questionId: string;
  readonly questionText: string;
  readonly type: string;
  readonly difficulty: string;
  readonly explanation: string | null;
  readonly points: number;
  readonly options: readonly BookmarkedQuestionOption[];
  readonly subject: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
  } | null;
  readonly topic: {
    readonly id: string;
    readonly code: string;
    readonly title: string;
  } | null;
  readonly unit: {
    readonly id: string;
    readonly code: string;
    readonly title: string;
  } | null;
  readonly questionBank?: {
    readonly id: string;
    readonly name: string;
  } | null;
  readonly assessmentType?: string | null;
  readonly assessmentTitle?: string | null;
  readonly correctAnswer?: string | null;
  readonly configuration?: unknown;
}

export interface BookmarkItem {
  readonly id: string;
  readonly targetType: BookmarkTargetType;
  readonly targetId: string;
  readonly note: string | null;
  readonly createdAt: string;
  readonly questionDetails?: BookmarkedQuestionDetails;
}

export interface ToggleBookmarkPayload {
  readonly targetType?: BookmarkTargetType;
  readonly targetId: string;
  readonly note?: string | null;
}

export interface ToggleBookmarkResponse {
  readonly bookmarked: boolean;
  readonly bookmarkId?: string;
}

export interface CheckBookmarksPayload {
  readonly targetType?: BookmarkTargetType;
  readonly targetIds: readonly string[];
}

export interface CheckBookmarksResponse {
  readonly bookmarkedIds: readonly string[];
}

export interface ListBookmarksParams {
  readonly targetType?: BookmarkTargetType;
  readonly subjectId?: string;
  readonly search?: string;
  readonly page?: number;
  readonly limit?: number;
}
