"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  Trash2,
  CheckCircle2,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useBookmarks, useDeleteBookmark } from "../hooks/useBookmarks";
import { BookmarkItem } from "../types/bookmark.types";
import { ROUTES } from "@/constants/routes";
import {
  TableToolbar,
  SelectDropdown,
  SelectDropdownOption,
  LoadingSpinner,
  ErrorAlert,
  ConfirmDeleteModal,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface AssessmentGroup {
  readonly assessmentTitle: string;
  readonly assessmentType?: string;
  readonly items: readonly BookmarkItem[];
}

interface SubjectBookmarkGroup {
  readonly subjectId: string;
  readonly subjectName: string;
  readonly subjectCode?: string;
  readonly assessmentGroups: readonly AssessmentGroup[];
  readonly totalCount: number;
}

const ASSESSMENT_TYPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "ALL", label: "All Exam Types" },
  { value: "PRACTICE", label: "Practice" },
  { value: "QUIZ", label: "Quiz" },
  { value: "EXAM", label: "School Exam" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "MOCK_EXAM", label: "Mock Exam" },
  { value: "DIAGNOSTIC", label: "Knowledge Check" },
];

function inferSubject(item: BookmarkItem): { id: string; name: string; code?: string } {
  const s = item.questionDetails?.subject;
  if (s?.name) {
    return { id: s.id || s.name, name: s.name, code: s.code };
  }

  const textToScan = `${item.note || ""} ${item.questionDetails?.assessmentTitle || ""} ${item.questionDetails?.questionBank?.name || ""}`.toLowerCase();

  if (textToScan.includes("math")) {
    return { id: "MATH", name: "Mathematics", code: "MATH" };
  }
  if (textToScan.includes("english")) {
    return { id: "ENG", name: "English", code: "ENG" };
  }
  if (textToScan.includes("biology")) {
    return { id: "BIO", name: "Biology", code: "BIO" };
  }
  if (textToScan.includes("chemistry")) {
    return { id: "CHEM", name: "Chemistry", code: "CHEM" };
  }
  if (textToScan.includes("physics")) {
    return { id: "PHYS", name: "Physics", code: "PHYS" };
  }
  if (textToScan.includes("science")) {
    return { id: "SCI", name: "General Science", code: "SCI" };
  }
  if (textToScan.includes("history")) {
    return { id: "HIST", name: "History", code: "HIST" };
  }
  if (textToScan.includes("geography")) {
    return { id: "GEOG", name: "Geography", code: "GEOG" };
  }
  if (textToScan.includes("amharic")) {
    return { id: "AMH", name: "Amharic", code: "AMH" };
  }
  if (textToScan.includes("ict") || textToScan.includes("computer")) {
    return { id: "ICT", name: "Information Technology", code: "ICT" };
  }

  return { id: "GENERAL", name: "General / Other" };
}

function inferAssessment(item: BookmarkItem): { title: string; type?: string } {
  const directTitle = item.questionDetails?.assessmentTitle || item.note || item.questionDetails?.questionBank?.name;
  const directType = item.questionDetails?.assessmentType;

  const title = directTitle || "Practice Questions";
  let type = directType;

  if (!type) {
    const lower = title.toLowerCase();
    if (lower.includes("quiz")) type = "QUIZ";
    else if (lower.includes("midterm") || lower.includes("final") || lower.includes("exam")) type = "EXAM";
    else if (lower.includes("mock")) type = "MOCK_EXAM";
    else if (lower.includes("assignment")) type = "ASSIGNMENT";
    else type = "PRACTICE";
  }

  return { title, type };
}

function getQuestionTypeLabel(type?: string): string {
  switch (type) {
    case "TRUE_FALSE":
      return "True / False";
    case "SHORT_ANSWER":
      return "Short Answer";
    case "NUMERIC":
      return "Numeric";
    case "LONG_ANSWER":
      return "Long Answer";
    case "MATCHING":
      return "Matching";
    case "ORDERING":
      return "Ordering";
    case "MCQ":
    case "MULTIPLE_CHOICE":
    default:
      return "Multiple Choice";
  }
}

function QuestionBookmarkCard({
  item,
  onRequestDelete,
}: {
  readonly item: BookmarkItem;
  readonly onRequestDelete: (item: BookmarkItem) => void;
}): React.JSX.Element {
  const q = item.questionDetails;

  const difficultyColors = useMemo(() => {
    switch (q?.difficulty) {
      case "HARD":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "EASY":
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
  }, [q?.difficulty]);

  const displayOptions = useMemo(() => {
    if (q?.options && q.options.length > 0) {
      return q.options;
    }
    if (q?.type === "TRUE_FALSE") {
      return [
        { optionKey: "T", optionText: "True", orderIndex: 0, isCorrect: true },
        { optionKey: "F", optionText: "False", orderIndex: 1, isCorrect: false },
      ];
    }
    return [];
  }, [q?.options, q?.type]);

  const isMcqOrTrueFalse = q?.type === "MCQ" || q?.type === "MULTIPLE_CHOICE" || q?.type === "TRUE_FALSE" || displayOptions.length > 0;

  return (
    <div className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 space-y-3.5 transition-all shadow-2xs hover:border-border">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
            {getQuestionTypeLabel(q?.type)}
          </span>
          {q?.topic && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground border border-border max-w-[200px] truncate">
              {q.topic.title}
            </span>
          )}
          {q?.difficulty && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${difficultyColors}`}
            >
              {q.difficulty}
            </span>
          )}
          {q?.points !== undefined && (
            <span className="text-[11px] font-mono font-semibold text-muted-foreground">
              {q.points} {q.points === 1 ? "pt" : "pts"}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRequestDelete(item)}
          aria-label="Remove saved question"
          className="inline-flex items-center gap-1 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-xs"
        >
          <Trash2 size={14} />
          <span className="hidden sm:inline text-[11px]">Remove</span>
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed whitespace-pre-wrap">
          {q?.questionText || "Question details unavailable"}
        </p>
      </div>

      {isMcqOrTrueFalse && displayOptions.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-border/60">
          <div className="space-y-1.5">
            {displayOptions.map((opt, idx) => {
              const isCorrect = opt.isCorrect === true;
              return (
                <div
                  key={opt.id || opt.optionKey || idx}
                  className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
                    isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/40 text-foreground font-semibold"
                      : "bg-muted/20 border-border text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                        isCorrect
                          ? "bg-emerald-500 text-white shadow-2xs"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {opt.optionKey}
                    </span>
                    <span className="break-words leading-relaxed">{opt.optionText}</span>
                  </div>
                  {isCorrect && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="hidden sm:inline">Correct</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isMcqOrTrueFalse && q?.correctAnswer && (
        <div className="pt-1 border-t border-border/60">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wide">
                Correct Answer:
              </span>
              <span className="font-semibold text-foreground">{q.correctAnswer}</span>
            </div>
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          </div>
        </div>
      )}

      {q?.explanation && (
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground space-y-1">
          <span className="font-bold text-primary block">Explanation:</span>
          <p className="leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
        </div>
      )}
    </div>
  );
}

export function StudentBookmarksView(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>("ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ALL");
  const [itemToDelete, setItemToDelete] = useState<BookmarkItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useBookmarks({
    targetType: "QUESTION",
    limit: 100,
  });

  const deleteMutation = useDeleteBookmark();

  const allItems = data?.items ?? [];

  const subjectOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code?: string }>();
    for (const item of allItems) {
      const s = inferSubject(item);
      if (!map.has(s.id)) {
        map.set(s.id, s);
      }
    }
    const list = Array.from(map.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({
        value: s.id,
        label: s.code ? `${s.name} (${s.code})` : s.name,
      }));
    return [{ value: "ALL", label: "All Subjects" }, ...list];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const q = item.questionDetails;
      const s = inferSubject(item);
      const a = inferAssessment(item);

      if (selectedSubjectId !== "ALL" && s.id !== selectedSubjectId) {
        return false;
      }

      if (selectedAssessmentType !== "ALL") {
        const matchesType = a.type?.toUpperCase() === selectedAssessmentType;
        const matchesDirectType = q?.assessmentType?.toUpperCase() === selectedAssessmentType;
        if (!matchesType && !matchesDirectType) {
          return false;
        }
      }

      if (search.trim()) {
        const query = search.toLowerCase();
        const textMatch = q?.questionText?.toLowerCase().includes(query);
        const topicMatch = q?.topic?.title?.toLowerCase().includes(query);
        const subjectMatch = s.name.toLowerCase().includes(query) || (s.code && s.code.toLowerCase().includes(query));
        const assessMatch = a.title.toLowerCase().includes(query);
        const answerMatch = q?.correctAnswer?.toLowerCase().includes(query);
        if (!textMatch && !topicMatch && !subjectMatch && !assessMatch && !answerMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, selectedAssessmentType, selectedSubjectId, search]);

  const groupedBySubject = useMemo<SubjectBookmarkGroup[]>(() => {
    const subjectMap = new Map<
      string,
      {
        subjectId: string;
        subjectName: string;
        subjectCode?: string;
        assessmentMap: Map<string, { title: string; type?: string; items: BookmarkItem[] }>;
      }
    >();

    for (const item of filteredItems) {
      const s = inferSubject(item);
      const a = inferAssessment(item);

      if (!subjectMap.has(s.id)) {
        subjectMap.set(s.id, {
          subjectId: s.id,
          subjectName: s.name,
          subjectCode: s.code,
          assessmentMap: new Map(),
        });
      }

      const sEntry = subjectMap.get(s.id)!;
      if (!sEntry.assessmentMap.has(a.title)) {
        sEntry.assessmentMap.set(a.title, {
          title: a.title,
          type: a.type,
          items: [],
        });
      }

      sEntry.assessmentMap.get(a.title)!.items.push(item);
    }

    return Array.from(subjectMap.values())
      .map((entry) => {
        const assessmentGroups = Array.from(entry.assessmentMap.values()).map((ag) => ({
          assessmentTitle: ag.title,
          assessmentType: ag.type,
          items: ag.items,
        }));
        const totalCount = assessmentGroups.reduce((acc, g) => acc + g.items.length, 0);

        return {
          subjectId: entry.subjectId,
          subjectName: entry.subjectName,
          subjectCode: entry.subjectCode,
          assessmentGroups,
          totalCount,
        };
      })
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }, [filteredItems]);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      setItemToDelete(null);
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, "Failed to remove saved question."));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3">
        <LoadingSpinner size={28} />
        <p className="text-xs text-muted-foreground font-medium">
          Loading saved questions...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-6 max-w-4xl mx-auto">
        <ErrorAlert
          title="Saved Questions Error"
          message={error ? getErrorMessage(error) : "Failed to load your saved questions. Please refresh or try again later."}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 animate-in fade-in-0 duration-300">
      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search saved questions by prompt, topic, exam, or subject..."
          actionButton={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <div className="w-full sm:w-44">
                <SelectDropdown
                  options={ASSESSMENT_TYPE_OPTIONS}
                  value={selectedAssessmentType}
                  onChange={setSelectedAssessmentType}
                  placeholder="All Exam Types"
                />
              </div>
              <div className="w-full sm:w-52">
                <SelectDropdown
                  options={subjectOptions}
                  value={selectedSubjectId}
                  onChange={setSelectedSubjectId}
                  placeholder="All Subjects"
                />
              </div>
            </div>
          }
        />
      </div>

      {groupedBySubject.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
            <Bookmark size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              {allItems.length === 0 ? "No Saved Questions" : "No Matching Questions"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {allItems.length === 0
                ? "Questions you save while practicing or reviewing exams will appear here organized by subject and exam."
                : "No saved questions match your current search or filter criteria."}
            </p>
          </div>
          {allItems.length === 0 && (
            <Link
              href={ROUTES.STUDENT.EXAMS}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              <span>Go to Exams</span>
              <ChevronRight size={13} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedBySubject.map((subjectGroup) => (
            <div
              key={subjectGroup.subjectId}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs space-y-5 p-4 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                      {subjectGroup.subjectName}
                    </h2>
                    {subjectGroup.subjectCode && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border shrink-0">
                        {subjectGroup.subjectCode}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs font-semibold text-muted-foreground shrink-0">
                  {subjectGroup.totalCount} {subjectGroup.totalCount === 1 ? "question" : "questions"}
                </span>
              </div>

              <div className="space-y-6">
                {subjectGroup.assessmentGroups.map((assessGroup) => (
                  <div
                    key={assessGroup.assessmentTitle}
                    className="space-y-3 rounded-2xl border border-border/60 bg-muted/15 p-3.5 sm:p-4.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={15} className="text-primary shrink-0" />
                        <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {assessGroup.assessmentTitle}
                        </h3>
                        {assessGroup.assessmentType && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                            {assessGroup.assessmentType}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {assessGroup.items.length} {assessGroup.items.length === 1 ? "question" : "questions"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {assessGroup.items.map((item) => (
                        <QuestionBookmarkCard
                          key={item.id}
                          item={item}
                          onRequestDelete={setItemToDelete}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => {
          setItemToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Remove Saved Question"
        description="Are you sure you want to remove this question from your saved questions? You can always save it again during practice."
        isPending={deleteMutation.isPending}
        errorMessage={deleteError}
      />
    </div>
  );
}
