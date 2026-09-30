"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Upload,
  ArrowLeft,
  HelpCircle,
  Filter,
  CheckSquare,
  Square,
  Binary,
  RotateCcw,
  Send,
  Archive,
  Trash2,
  CheckCheck,
  Tag,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/constants/routes";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  QuestionListItem,
  QuestionType,
  DifficultyLevel,
  QuestionStatus,
} from "../../types/question-bank.types";
import {
  useQuestions,
  useUpdateQuestionStatus,
  usePublishQuestion,
  useDeleteQuestion,
  useResolveQuestionReport,
  useBulkPublishQuestions,
  useBulkArchiveQuestions,
  useBulkDeleteQuestions,
} from "../../hooks/useQuestions";
import { useQuestionBank } from "../../hooks/useQuestionBanks";
import { QuestionCardItem } from "./QuestionCardItem";
import { QuestionFormModal } from "./QuestionFormModal";
import { QuestionPreviewModal } from "./QuestionPreviewModal";
import { QuestionUploadModal } from "../upload/QuestionUploadModal";
import { ConfirmDeleteModal } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface QuestionListViewProps {
  readonly bankId: string;
}

export function QuestionListView({ bankId }: QuestionListViewProps) {
  const user = useAuthStore((state) => state.user);
  const isStudent = user?.roles?.includes("STUDENT");

  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionListItem | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: bank, isLoading: isBankLoading } = useQuestionBank(bankId);
  const { data: questionsData, isLoading: isQuestionsLoading, error } = useQuestions(
    bankId,
    {
      search: search.trim() || undefined,
      topicId: topicFilter === "ALL" ? undefined : topicFilter,
      type: typeFilter === "ALL" ? undefined : (typeFilter as QuestionType),
      difficulty:
        difficultyFilter === "ALL"
          ? undefined
          : (difficultyFilter as DifficultyLevel),
      status: isStudent
        ? ("PUBLISHED" as QuestionStatus)
        : statusFilter === "ALL"
        ? undefined
        : (statusFilter as QuestionStatus),
      page,
      limit: 50,
    }
  );

  const statusMutation = useUpdateQuestionStatus(bankId);
  const publishMutation = usePublishQuestion(bankId);
  const deleteMutation = useDeleteQuestion(bankId);
  const resolveReportMutation = useResolveQuestionReport(bankId);
  const bulkPublishMutation = useBulkPublishQuestions(bankId);
  const bulkArchiveMutation = useBulkArchiveQuestions(bankId);
  const bulkDeleteMutation = useBulkDeleteQuestions(bankId);

  const items = questionsData?.items ?? [];

  const draftQuestions = useMemo(
    () => items.filter((q) => q.status === "DRAFT" || q.status === "REVIEW"),
    [items]
  );

  const publishedQuestions = useMemo(
    () => items.filter((q) => q.status === "PUBLISHED"),
    [items]
  );

  const handleToggleSelect = (id: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedQuestionIds.size === items.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(items.map((q) => q.id)));
    }
  };

  const handleBulkPublishSelected = async () => {
    const ids = Array.from(selectedQuestionIds);
    if (ids.length === 0) return;
    await bulkPublishMutation.mutateAsync(ids);
    setSelectedQuestionIds(new Set());
  };

  const handleBulkArchiveSelected = async () => {
    const ids = Array.from(selectedQuestionIds);
    if (ids.length === 0) return;
    await bulkArchiveMutation.mutateAsync(ids);
    setSelectedQuestionIds(new Set());
  };

  const handlePublishAllDrafts = async () => {
    const ids = draftQuestions.map((q) => q.id);
    if (ids.length === 0) return;
    await bulkPublishMutation.mutateAsync(ids);
  };

  const handleArchiveAllPublished = async () => {
    const ids = publishedQuestions.map((q) => q.id);
    if (ids.length === 0) return;
    await bulkArchiveMutation.mutateAsync(ids);
  };

  const handleConfirmBulkDelete = async () => {
    const ids = Array.from(selectedQuestionIds);
    if (ids.length === 0) return;
    setDeleteErrorMessage(null);
    try {
      await bulkDeleteMutation.mutateAsync(ids);
      setSelectedQuestionIds(new Set());
      setIsBulkDeleteOpen(false);
    } catch (err: unknown) {
      setDeleteErrorMessage(
        getErrorMessage(
          err,
          "Failed to delete some selected questions. They may be locked by active assessments."
        )
      );
    }
  };

  const handleResolveReport = async (questionId: string, reportId: string) => {
    await resolveReportMutation.mutateAsync({ questionId, reportId });
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleEdit = (question: QuestionListItem) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handlePublish = async (id: string) => {
    await publishMutation.mutateAsync(id);
  };

  const handleArchive = async (id: string) => {
    await statusMutation.mutateAsync({ id, status: "ARCHIVED" });
  };

  const handleActivate = async (id: string) => {
    await statusMutation.mutateAsync({ id, status: "DRAFT" });
  };

  const handleDelete = (id: string, code: string) => {
    setDeleteErrorMessage(null);
    setDeleteTarget({ id, code });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteErrorMessage(null);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteErrorMessage(
        getErrorMessage(
          err,
          "Failed to delete question. Please ensure it is not locked by active assessments."
        )
      );
    }
  };

  const handleOptionSelect = (questionId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleToggleExplanation = (questionId: string) => {
    setRevealedExplanations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleResetPractice = () => {
    setSelectedAnswers({});
    setRevealedExplanations({});
  };

  const practiceStats = useMemo(() => {
    let correct = 0;
    let attempted = 0;
    for (const q of items) {
      const selected = selectedAnswers[q.id];
      if (selected) {
        attempted++;
        const correctOpt = q.options?.find((o) => o.isCorrect);
        if (correctOpt && (correctOpt.id === selected || correctOpt.text === selected)) {
          correct++;
        }
      }
    }
    return { correct, attempted, total: items.length };
  }, [items, selectedAnswers]);

  const availableTopics = useMemo(() => {
    const map = new Map<string, string>();
    for (const q of items) {
      if (q.topic?.id && q.topic?.title) {
        map.set(q.topic.id, q.topic.title);
      }
    }
    return Array.from(map.entries()).map(([id, title]) => ({
      label: title,
      value: id,
    }));
  }, [items]);

  const toolbarFilters: readonly FilterGroup[] = useMemo(() => {
    const filters: FilterGroup[] = [];

    if (availableTopics.length > 0) {
      filters.push({
        id: "topic",
        label: "Topic",
        icon: Tag,
        selectedValue: topicFilter,
        onSelect: (val) => {
          setTopicFilter(val);
          setPage(1);
        },
        options: [
          { label: "All Topics", value: "ALL" },
          ...availableTopics,
        ],
      });
    }

    filters.push(
      {
        id: "type",
        label: "Type",
        icon: CheckSquare,
        selectedValue: typeFilter,
        onSelect: (val) => {
          setTypeFilter(val);
          setPage(1);
        },
        options: [
          { label: "All", value: "ALL" },
          { label: "Multiple Choice", value: "MCQ" },
          { label: "True / False", value: "TRUE_FALSE" },
          { label: "Short Answer", value: "SHORT_ANSWER" },
          { label: "Long Answer", value: "LONG_ANSWER" },
          { label: "Numeric", value: "NUMERIC" },
          { label: "Matching", value: "MATCHING" },
          { label: "Ordering", value: "ORDERING" },
        ],
      },
      {
        id: "difficulty",
        label: "Difficulty",
        icon: Binary,
        selectedValue: difficultyFilter,
        onSelect: (val) => {
          setDifficultyFilter(val);
          setPage(1);
        },
        options: [
          { label: "All", value: "ALL" },
          { label: "Easy", value: "EASY" },
          { label: "Medium", value: "MEDIUM" },
          { label: "Hard", value: "HARD" },
        ],
      }
    );

    if (!isStudent) {
      filters.push({
        id: "status",
        label: "Status",
        icon: Filter,
        selectedValue: statusFilter,
        onSelect: (val) => {
          setStatusFilter(val);
          setPage(1);
        },
        options: [
          { label: "All", value: "ALL" },
          { label: "Draft", value: "DRAFT" },
          { label: "Approved", value: "APPROVED" },
          { label: "Published", value: "PUBLISHED" },
          { label: "Archived", value: "ARCHIVED" },
        ],
      });
    }

    return filters;
  }, [availableTopics, topicFilter, typeFilter, difficultyFilter, statusFilter, isStudent]);

  const isAnyBulkPending =
    bulkPublishMutation.isPending ||
    bulkArchiveMutation.isPending ||
    bulkDeleteMutation.isPending;

  return (
    <div className="space-y-3.5 sm:space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href={ROUTES.QUESTION_BANK.BANKS}
          className="hover:text-foreground transition-colors flex items-center gap-1 font-medium"
        >
          <ArrowLeft size={13} />
          <span>Question Banks</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold truncate">
          {bank?.name || "Loading..."}
        </span>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-base sm:text-lg font-bold text-foreground">
              {bank?.name || "Question Bank"}
            </h1>
            {isStudent && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Practice Mode
              </span>
            )}
          </div>
          {bank?.description && (
            <p className="text-xs text-muted-foreground max-w-2xl line-clamp-2">
              {bank.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {isStudent ? (
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-muted border border-border flex items-center gap-2">
                <span className="text-muted-foreground">Score:</span>
                <span className="text-foreground font-bold">
                  {practiceStats.correct} / {practiceStats.attempted}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  ({practiceStats.total} total)
                </span>
              </div>
              {practiceStats.attempted > 0 && (
                <button
                  type="button"
                  onClick={handleResetPractice}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              >
                <Upload size={14} />
                <span>Upload Document</span>
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus size={14} />
                <span>Add Question</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <ErrorAlert message={error.message || "Failed to load questions."} />
      )}

      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder="Search questions..."
          filters={toolbarFilters}
        />
      </div>

      {/* Bulk Action & Management Toolbar (For Teachers & Admins) */}
      {!isStudent && items.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3 flex-wrap animate-in fade-in-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {selectedQuestionIds.size === items.length ? (
                <CheckSquare size={16} className="text-primary" />
              ) : (
                <Square size={16} className="text-muted-foreground" />
              )}
              <span>
                {selectedQuestionIds.size === items.length
                  ? "Deselect All"
                  : "Select All"}
              </span>
            </button>

            <span className="text-xs text-muted-foreground font-medium">
              {selectedQuestionIds.size} of {items.length} selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {selectedQuestionIds.size > 0 ? (
              <>
                <button
                  type="button"
                  onClick={handleBulkPublishSelected}
                  disabled={isAnyBulkPending}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                >
                  <Send size={12} />
                  <span>
                    {bulkPublishMutation.isPending
                      ? "Publishing..."
                      : `Publish Selected (${selectedQuestionIds.size})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkArchiveSelected}
                  disabled={isAnyBulkPending}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                >
                  <Archive size={12} />
                  <span>
                    {bulkArchiveMutation.isPending
                      ? "Archiving..."
                      : `Archive Selected (${selectedQuestionIds.size})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  disabled={isAnyBulkPending}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/30 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                >
                  <Trash2 size={12} />
                  <span>Delete Selected</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedQuestionIds(new Set())}
                  className="text-xs text-muted-foreground hover:underline px-1 cursor-pointer"
                >
                  Clear
                </button>
              </>
            ) : (
              <>
                {draftQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handlePublishAllDrafts}
                    disabled={bulkPublishMutation.isPending}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/20 border border-emerald-600/30 transition-colors cursor-pointer"
                  >
                    <CheckCheck size={13} />
                    <span>
                      {bulkPublishMutation.isPending
                        ? "Publishing..."
                        : `Publish All Drafts (${draftQuestions.length})`}
                    </span>
                  </button>
                )}

                {publishedQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleArchiveAllPublished}
                    disabled={bulkArchiveMutation.isPending}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Archive size={12} />
                    <span>
                      {bulkArchiveMutation.isPending
                        ? "Archiving..."
                        : `Archive All (${publishedQuestions.length})`}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {isQuestionsLoading || isBankLoading ? (
        <div className="min-h-[300px] flex items-center justify-center p-8">
          <LoadingSpinner size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-card rounded-2xl border border-border">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <HelpCircle size={20} />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            No Questions in this Bank
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            {isStudent
              ? "No published questions are available in this question bank yet."
              : "Add your first question manually or upload an exam document to extract questions automatically."}
          </p>
          {!isStudent && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Question</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Upload size={13} />
                <span>Upload Document</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((question, qIndex) => (
            <QuestionCardItem
              key={question.id}
              question={question}
              qIndex={qIndex}
              isStudent={isStudent}
              isSelected={selectedQuestionIds.has(question.id)}
              onToggleSelect={() => handleToggleSelect(question.id)}
              selectedOptKey={selectedAnswers[question.id]}
              onOptionSelect={handleOptionSelect}
              isExplanationOpen={Boolean(revealedExplanations[question.id])}
              onToggleExplanation={handleToggleExplanation}
              onPreview={(q) => setPreviewQuestion(q)}
              onEdit={handleEdit}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onActivate={handleActivate}
              onDelete={handleDelete}
              onResolveReport={handleResolveReport}
              isBusy={
                publishMutation.isPending ||
                deleteMutation.isPending ||
                statusMutation.isPending ||
                resolveReportMutation.isPending ||
                bulkPublishMutation.isPending ||
                bulkArchiveMutation.isPending ||
                bulkDeleteMutation.isPending
              }
            />
          ))}
        </div>
      )}

      <QuestionFormModal
        bankId={bankId}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingQuestion(null);
        }}
        initialData={editingQuestion}
      />

      <QuestionPreviewModal
        isOpen={Boolean(previewQuestion)}
        onClose={() => setPreviewQuestion(null)}
        question={previewQuestion}
        onEdit={(q) => {
          setPreviewQuestion(null);
          setEditingQuestion(q as QuestionListItem);
          setIsFormOpen(true);
        }}
        onPublish={handlePublish}
        onArchive={handleArchive}
        isStudent={isStudent}
      />

      <QuestionUploadModal
        bankId={bankId}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteErrorMessage(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        itemName={deleteTarget?.code}
        isPending={deleteMutation.isPending}
        errorMessage={deleteErrorMessage}
      />

      <ConfirmDeleteModal
        isOpen={isBulkDeleteOpen}
        onClose={() => {
          setIsBulkDeleteOpen(false);
          setDeleteErrorMessage(null);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Selected Questions"
        description={`Are you sure you want to delete ${selectedQuestionIds.size} selected question(s)? This action cannot be undone.`}
        itemName={`${selectedQuestionIds.size} questions`}
        isPending={bulkDeleteMutation.isPending}
        errorMessage={deleteErrorMessage}
      />
    </div>
  );
}

