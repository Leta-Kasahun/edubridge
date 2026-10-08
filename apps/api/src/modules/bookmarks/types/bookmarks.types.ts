import { BookmarkTargetType } from "../../../generated/prisma/enums.js";

export type BookmarkTargetTypeEnum = BookmarkTargetType;

export interface ToggleBookmarkInput {
  targetType: BookmarkTargetTypeEnum;
  targetId: string;
  note?: string | null;
}

export interface ToggleBookmarkResult {
  bookmarked: boolean;
  bookmarkId?: string;
}

export interface CheckBookmarksInput {
  targetType: BookmarkTargetTypeEnum;
  targetIds: string[];
}

export interface CheckBookmarksResult {
  bookmarkedIds: string[];
}

export interface ListBookmarksQuery {
  targetType?: BookmarkTargetTypeEnum;
  subjectId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookmarkedQuestionOption {
  id?: string;
  optionKey: string;
  optionText: string;
  orderIndex: number;
  isCorrect?: boolean;
}

export interface BookmarkedQuestionDetails {
  questionId: string;
  questionText: string;
  type: string;
  difficulty: string;
  explanation: string | null;
  points: number;
  options: BookmarkedQuestionOption[];
  subject: {
    id: string;
    code: string;
    name: string;
  } | null;
  topic: {
    id: string;
    code: string;
    title: string;
  } | null;
  unit: {
    id: string;
    code: string;
    title: string;
  } | null;
  questionBank?: {
    id: string;
    name: string;
  } | null;
  assessmentType?: string | null;
  assessmentTitle?: string | null;
  correctAnswer?: string | null;
  configuration?: unknown;
}

export interface BookmarkedContentDetails {
  contentId: string;
  title: string;
  type: string;
  description: string | null;
  subject: {
    id: string;
    code: string;
    name: string;
  } | null;
  gradeLevel?: number | null;
}

export interface BookmarkedTopicDetails {
  topicId: string;
  code: string;
  title: string;
  unit: {
    id: string;
    code: string;
    title: string;
  } | null;
  subject: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface EnrichedBookmarkItem {
  id: string;
  targetType: BookmarkTargetTypeEnum;
  targetId: string;
  note: string | null;
  createdAt: Date;
  questionDetails?: BookmarkedQuestionDetails;
  contentDetails?: BookmarkedContentDetails;
  topicDetails?: BookmarkedTopicDetails;
}

export interface PaginatedBookmarksResponse {
  items: EnrichedBookmarkItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
