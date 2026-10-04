"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  Search,
  BookOpen,
  Trash2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  GraduationCap,
  FileText,
  HelpCircle,
  Check,
  Hash,
  Filter,
} from "lucide-react";
import { useBookmarkStore, BookmarkedQuestion } from "@/stores/bookmark.store";
import { QuestionDifficultyBadge } from "@/features/question-bank/components/questions/QuestionBadges";
import { buildOptionLabel } from "@/shared/utils/question.util";
import { ROUTES } from "@/constants/routes";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { QuestionType } from "@/features/question-bank/types/question-bank.types";

export function StudentBookmarksView(): React.JSX.Element {
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const updateNote = useBookmarkStore((s) => s.updateNote);
  const clearAllBookmarks = useBookmarkStore((s) => s.clearAllBookmarks);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [isStudyMode, setIsStudyMode] = useState(true); // true = study mode (answers visible on demand), false = self-test quiz mode

  // Interactive self-test state for questions
  const [userAnswers, setUserAnswers] = useState<Map<string, unknown>>(new Map());
  const [revealedSolutions, setRevealedSolutions] = useState<Set<string>>(new Set());
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Map<string, string>>(new Map());
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Derive unique subjects from bookmarks
  const subjectOptions = useMemo(() => {
    const subjects = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.subjectName) subjects.add(b.subjectName);
    });
    return Array.from(subjects);
  }, [bookmarks]);

  const difficultyOptions: readonly SelectDropdownOption[] = [
    { value: "ALL", label: "All Difficulties" },
    { value: "EASY", label: "Easy" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HARD", label: "Hard" },
  ];

  const typeOptions: readonly SelectDropdownOption[] = [
    { value: "ALL", label: "All Question Types" },
    { value: "MCQ", label: "Multiple Choice" },
    { value: "TRUE_FALSE", label: "True / False" },
    { value: "SHORT_ANSWER", label: "Short Answer" },
    { value: "LONG_ANSWER", label: "Long Answer" },
    { value: "NUMERIC", label: "Numeric" },
  ];

  const subjectDropdownOptions: readonly SelectDropdownOption[] = [
    { value: "ALL", label: "All Subjects" },
    ...subjectOptions.map((sub) => ({ value: sub, label: sub })),
  ];

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText = b.questionText.toLowerCase().includes(q);
        const matchesNote = b.note?.toLowerCase().includes(q);
        const matchesOrigin = b.assessmentTitle?.toLowerCase().includes(q);
        if (!matchesText && !matchesNote && !matchesOrigin) return false;
      }

      if (selectedDifficulty !== "ALL" && b.difficulty !== selectedDifficulty) {
        return false;
      }

      if (selectedType !== "ALL" && b.type !== selectedType) {
        return false;
      }

      if (selectedSubject !== "ALL" && b.subjectName !== selectedSubject) {
        return false;
      }

      return true;
    });
  }, [bookmarks, searchQuery, selectedDifficulty, selectedType, selectedSubject]);

  const toggleSolutionReveal = (id: string) => {
    setRevealedSolutions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAnswer = (questionVersionId: string, answer: unknown) => {
    setUserAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionVersionId, answer);
      return next;
    });
  };

  const handleSaveNote = (questionVersionId: string) => {
    const text = noteInputs.get(questionVersionId) ?? "";
    updateNote(questionVersionId, text);
    setEditingNoteId(null);
  };

  const handleStartEditNote = (b: BookmarkedQuestion) => {
    setEditingNoteId(b.questionVersionId);
    setNoteInputs((prev) => new Map(prev).set(b.questionVersionId, b.note || ""));
  };

  const handleResetQuiz = () => {
    setUserAnswers(new Map());
    setRevealedSolutions(new Set());
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-0 duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Bookmark className="h-5 w-5 fill-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Saved Questions
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                  {bookmarks.length} {bookmarks.length === 1 ? "Question" : "Questions"}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                My Exams &gt; Bookmark · Revisit and master tough questions saved during exams.
              </p>
            </div>
          </div>
        </div>

        {bookmarks.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsStudyMode((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isStudyMode
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              <Lightbulb size={14} />
              <span>{isStudyMode ? "Study Mode (Solutions on Demand)" : "Self-Test Quiz Mode"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics overview */}
      {bookmarks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Saved
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground font-mono">
                {bookmarks.length}
              </span>
              <span className="text-xs text-primary font-medium">Bookmarks</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Hard Questions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                {bookmarks.filter((b) => b.difficulty === "HARD").length}
              </span>
              <span className="text-xs text-muted-foreground">High Challenge</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Subjects
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground font-mono">
                {subjectOptions.length || 1}
              </span>
              <span className="text-xs text-muted-foreground">Domains</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Study Notes Added
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {bookmarks.filter((b) => Boolean(b.note?.trim())).length}
              </span>
              <span className="text-xs text-muted-foreground">Personal Notes</span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      {bookmarks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in question prompt or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-3">
            <SelectDropdown
              value={selectedDifficulty}
              onChange={setSelectedDifficulty}
              options={difficultyOptions}
              placeholder="Filter Difficulty"
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-3">
            <SelectDropdown
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
              placeholder="Filter Question Type"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetQuiz}
              className="w-full h-10 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Reset practice answers"
            >
              <RotateCcw size={13} />
              <span>Reset Test</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content List */}
      {bookmarks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 sm:p-16 text-center flex flex-col items-center justify-center bg-card shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xs">
            <Bookmark className="h-8 w-8 fill-primary/30 text-primary" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              No Bookmarked Questions Yet
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              When taking your exams or reviewing your completed results, click the{" "}
              <strong className="text-foreground">Save Question</strong> button on any question to bookmark it here for targeted revision and practice.
            </p>
          </div>
          <Link
            href={ROUTES.ASSESSMENTS.BASE}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer mt-2"
          >
            <GraduationCap size={16} />
            <span>Browse My Exams</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="rounded-2xl border border-border p-10 text-center bg-card space-y-2">
          <Filter className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            No Matching Questions
          </h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search keywords or filter criteria to view your saved questions.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookmarks.map((bookmark, idx) => {
            const qKey = bookmark.questionVersionId;
            const isRevealed = revealedSolutions.has(qKey);
            const userAnswer = userAnswers.get(qKey);
            const hasAnswered = userAnswer !== undefined && userAnswer !== null && userAnswer !== "";
            const isEditingNote = editingNoteId === qKey;
            const correctOpt = bookmark.options.find((o) => o.isCorrect);

            return (
              <div
                key={qKey}
                className="bg-card rounded-2xl border border-border shadow-xs p-5 sm:p-7 space-y-5 transition-all duration-200 hover:border-primary/40 group"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 flex-wrap pb-3.5 border-b border-border">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs font-mono">
                      #{idx + 1}
                    </span>
                    <QuestionDifficultyBadge difficulty={bookmark.difficulty} />
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                      {bookmark.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {bookmark.points} {bookmark.points === 1 ? "point" : "points"}
                    </span>
                    {bookmark.assessmentTitle && (
                      <span className="text-[11px] font-medium text-muted-foreground/80 truncate max-w-xs flex items-center gap-1">
                        <FileText size={12} className="text-primary" />
                        From: {bookmark.assessmentTitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeBookmark(qKey)}
                      className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors cursor-pointer"
                      title="Remove from saved bookmarks"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground leading-relaxed whitespace-pre-wrap">
                    {bookmark.questionText}
                  </h3>
                </div>

                {/* Options / Interactive Input */}
                {bookmark.type === "MCQ" && bookmark.options.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    {bookmark.options.map((opt, optIdx) => {
                      const letter = buildOptionLabel(optIdx);
                      const isSelected = userAnswer === opt.optionKey;
                      const isOptionCorrect = opt.isCorrect === true;

                      let btnStyle = "bg-card border-border text-foreground hover:bg-muted/40";

                      if (isStudyMode || isRevealed) {
                        if (isOptionCorrect) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500/60 text-emerald-700 dark:text-emerald-400 font-semibold";
                        } else if (isSelected && !isOptionCorrect) {
                          btnStyle = "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-medium";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-primary/10 border-primary text-foreground font-semibold ring-1 ring-primary/30";
                      }

                      return (
                        <button
                          key={opt.id || opt.optionKey}
                          type="button"
                          onClick={() => handleSelectAnswer(qKey, opt.optionKey)}
                          className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="text-xs sm:text-sm">{opt.optionText}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {(isStudyMode || isRevealed) && isOptionCorrect && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/15">
                                <Check size={12} strokeWidth={3} /> Correct Answer
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {bookmark.type === "TRUE_FALSE" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      { key: "true", label: "True" },
                      { key: "false", label: "False" },
                    ].map((tf) => {
                      const isSelected = String(userAnswer) === tf.key;
                      const isOptionCorrect =
                        (tf.key === "true" && bookmark.options.find((o) => o.optionKey === "true" || o.optionKey === "T")?.isCorrect) ||
                        (tf.key === "false" && bookmark.options.find((o) => o.optionKey === "false" || o.optionKey === "F")?.isCorrect);

                      let style = "bg-card border-border text-foreground hover:bg-muted/40";
                      if (isStudyMode || isRevealed) {
                        if (isOptionCorrect) {
                          style = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
                        } else if (isSelected && !isOptionCorrect) {
                          style = "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-bold";
                        }
                      } else if (isSelected) {
                        style = "bg-primary/10 border-primary text-foreground font-bold";
                      }

                      return (
                        <button
                          key={tf.key}
                          type="button"
                          onClick={() => handleSelectAnswer(qKey, tf.key)}
                          className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${style}`}
                        >
                          <span className="text-xs sm:text-sm font-semibold">{tf.label}</span>
                          {(isStudyMode || isRevealed) && isOptionCorrect && (
                            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {bookmark.type === "NUMERIC" && (
                  <div className="space-y-2 pt-1 max-w-sm">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Hash size={13} /> Try entering numeric answer:
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 42 or 3.14"
                      value={typeof userAnswer === "number" || typeof userAnswer === "string" ? String(userAnswer) : ""}
                      onChange={(e) => handleSelectAnswer(qKey, e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-border bg-card text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                {(bookmark.type === "SHORT_ANSWER" || bookmark.type === "LONG_ANSWER") && (
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Practice your response:
                    </label>
                    <textarea
                      rows={bookmark.type === "LONG_ANSWER" ? 4 : 2}
                      placeholder="Write your explanation or answer..."
                      value={typeof userAnswer === "string" ? userAnswer : ""}
                      onChange={(e) => handleSelectAnswer(qKey, e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                  </div>
                )}

                {/* Solution Toggle & Study Notes */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSolutionReveal(qKey)}
                      className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Lightbulb size={14} className="text-amber-500" />
                      <span>{isRevealed ? "Hide Solution Note" : "Reveal Solution & Explanation"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEditNote(bookmark)}
                      className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <FileText size={13} />
                      <span>{bookmark.note ? "Edit Study Note" : "Add Personal Note"}</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-muted-foreground font-mono">
                    Saved on {new Date(bookmark.savedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Revealed Explanation */}
                {isRevealed && (
                  <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in-0 space-y-1.5">
                    <strong className="text-foreground flex items-center gap-1.5 font-bold">
                      <Sparkles size={14} className="text-amber-500" />
                      Detailed Explanation & Solution:
                    </strong>
                    <p>
                      {bookmark.explanation || "No additional explanation was recorded for this question version."}
                    </p>
                    {correctOpt && (
                      <p className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                        Correct Answer Key: {correctOpt.optionText}
                      </p>
                    )}
                  </div>
                )}

                {/* Personal Study Note Box */}
                {isEditingNote ? (
                  <div className="p-4 rounded-xl bg-card border border-border space-y-2.5 animate-in fade-in-0 shadow-2xs">
                    <label className="text-xs font-bold text-foreground block">
                      My Personal Study Note:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Write your study tips, key formula, or why you bookmarked this question..."
                      value={noteInputs.get(qKey) ?? ""}
                      onChange={(e) =>
                        setNoteInputs((prev) => new Map(prev).set(qKey, e.target.value))
                      }
                      className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNote(qKey)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  bookmark.note && (
                    <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary flex items-center gap-1">
                          <FileText size={12} /> My Note:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartEditNote(bookmark)}
                          className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-foreground">{bookmark.note}</p>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 shadow-xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-foreground">
                Clear All Bookmarks?
              </h3>
              <p className="text-xs text-muted-foreground">
                This will remove all {bookmarks.length} saved questions from your bookmarks list. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllBookmarks();
                  setIsClearModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors cursor-pointer shadow-xs"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
