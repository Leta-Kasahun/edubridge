import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { QuestionType, DifficultyLevel } from "@/features/question-bank/types/question-bank.types";

export interface BookmarkedQuestionOption {
  readonly id?: string;
  readonly optionKey: string;
  readonly optionText: string;
  readonly isCorrect?: boolean;
}

export interface BookmarkedQuestion {
  readonly questionVersionId: string;
  readonly questionId?: string;
  readonly assessmentId?: string;
  readonly assessmentTitle?: string;
  readonly subjectId?: string;
  readonly subjectName?: string;
  readonly type: QuestionType;
  readonly difficulty: DifficultyLevel;
  readonly points: number;
  readonly questionText: string;
  readonly options: readonly BookmarkedQuestionOption[];
  readonly explanation?: string | null;
  readonly savedAt: string;
  readonly note?: string;
  readonly userAnswer?: unknown;
  readonly isCorrect?: boolean | null;
}

export type SaveBookmarkPayload = Omit<BookmarkedQuestion, "savedAt">;

interface BookmarkState {
  readonly bookmarks: readonly BookmarkedQuestion[];
}

interface BookmarkActions {
  readonly addBookmark: (item: SaveBookmarkPayload) => void;
  readonly removeBookmark: (questionVersionId: string) => void;
  readonly toggleBookmark: (item: SaveBookmarkPayload) => boolean;
  readonly isBookmarked: (questionVersionId: string) => boolean;
  readonly updateNote: (questionVersionId: string, note: string) => void;
  readonly clearAllBookmarks: () => void;
}

export type BookmarkStore = BookmarkState & BookmarkActions;

const STORAGE_KEY = "edubridge_student_question_bookmarks";

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (item) => {
        const { bookmarks } = get();
        if (bookmarks.some((b) => b.questionVersionId === item.questionVersionId)) {
          return;
        }
        const newBookmark: BookmarkedQuestion = {
          ...item,
          savedAt: new Date().toISOString(),
        };
        set({ bookmarks: [newBookmark, ...bookmarks] });
      },

      removeBookmark: (questionVersionId) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (b) => b.questionVersionId !== questionVersionId
          ),
        }));
      },

      toggleBookmark: (item) => {
        const { bookmarks } = get();
        const exists = bookmarks.some(
          (b) => b.questionVersionId === item.questionVersionId
        );

        if (exists) {
          set({
            bookmarks: bookmarks.filter(
              (b) => b.questionVersionId !== item.questionVersionId
            ),
          });
          return false;
        } else {
          const newBookmark: BookmarkedQuestion = {
            ...item,
            savedAt: new Date().toISOString(),
          };
          set({ bookmarks: [newBookmark, ...bookmarks] });
          return true;
        }
      },

      isBookmarked: (questionVersionId) => {
        return get().bookmarks.some(
          (b) => b.questionVersionId === questionVersionId
        );
      },

      updateNote: (questionVersionId, note) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.questionVersionId === questionVersionId
              ? { ...b, note: note.trim() || undefined }
              : b
          ),
        }));
      },

      clearAllBookmarks: () => {
        set({ bookmarks: [] });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
