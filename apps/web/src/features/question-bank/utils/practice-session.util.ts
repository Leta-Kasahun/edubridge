export interface StoredPracticeSession {
  readonly bankId: string;
  readonly bankTitle: string;
  readonly subjectCode?: string;
  readonly subjectName?: string;
  readonly currentIndex: number;
  readonly selectedAnswers: Record<string, string>;
  readonly flaggedQuestionIds: string[];
  readonly eliminatedOptions: Record<string, string[]>;
  readonly revealedExplanations: Record<string, boolean>;
  readonly secondsElapsed: number;
  readonly lastUpdated: number;
  readonly totalQuestions: number;
}

const STORAGE_PREFIX = "edubridge_practice_session_";

export const practiceSessionStorage = {
  saveSession(session: StoredPracticeSession): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}${session.bankId}`,
        JSON.stringify(session)
      );
    } catch {
      // Ignore storage errors (e.g. quota exceeded / incognito)
    }
  },

  getSession(bankId: string): StoredPracticeSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${bankId}`);
      if (!raw) return null;
      return JSON.parse(raw) as StoredPracticeSession;
    } catch {
      return null;
    }
  },

  clearSession(bankId: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${bankId}`);
    } catch {
      // Ignore storage errors
    }
  },

  getLatestActiveSession(): StoredPracticeSession | null {
    if (typeof window === "undefined") return null;
    try {
      const sessions: StoredPracticeSession[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw) as StoredPracticeSession;
            if (
              parsed &&
              parsed.bankId &&
              Object.keys(parsed.selectedAnswers || {}).length > 0
            ) {
              sessions.push(parsed);
            }
          }
        }
      }

      if (sessions.length === 0) return null;
      sessions.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
      return sessions[0] || null;
    } catch {
      return null;
    }
  },
};
