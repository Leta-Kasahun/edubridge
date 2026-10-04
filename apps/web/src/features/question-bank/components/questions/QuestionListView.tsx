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
  Send,
  Archive,
  Trash2,
  CheckCheck,
  Tag,
} from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

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
      status: statusFilter === "ALL" ? undefined : (statusFilter as QuestionStatus),
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
      },
      {
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
      }
    );

    return filters;
  }, [availableTopics, topicFilter, typeFilter, difficultyFilter, statusFilter]);

  const isAnyBulkPending =
    bulkPublishMutation.isPending ||
    bulkArchiveMutation.isPending ||
    bulkDeleteMutation.isPending;

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      {/* Enterprise Single-Row Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Link
            href={ROUTES.QUESTION_BANK.BANKS}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1 rounded-lg transition-colors shrink-0"
            title="Back to Question Banks"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>

          <span className="text-border text-xs font-light select-none">|</span>

          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
              {bank?.name || "Question Bank"}
            </h1>

            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                {items.length} {items.length === 1 ? "Question" : "Questions"}
              </span>
              {bank?.subject?.name && (
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border whitespace-nowrap">
                  {bank.subject.name}
                </span>
              )}
              {bank?.grade && (
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border whitespace-nowrap">
                  Grade {bank.grade.level}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
            title="Upload Document"
          >
            <Upload size={13} />
            <span>Upload</span>
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-1 h-8 sm:h-8.5 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
            title="Add Question"
          >
            <Plus size={14} />
            <span>Question</span>
          </button>
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
          searchPlaceholder="Search questions by text or topic..."
          filters={toolbarFilters}
        />
      </div>

      {/* Bulk Action & Management Toolbar */}
      {items.length > 0 && (
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

      {/* Questions List */}
      {isBankLoading || isQuestionsLoading ? (
        <div className="p-12 flex items-center justify-center">
          <LoadingSpinner size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <HelpCircle size={20} />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            No Questions in this Bank
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            Upload a document or add questions manually to start building this question repository.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
            >
              <Upload size={13} />
              <span>Upload Document</span>
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus size={13} />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((q, idx) => (
            <QuestionCardItem
              key={q.id}
              question={q}
              qIndex={idx}
              isSelected={selectedQuestionIds.has(q.id)}
              onToggleSelect={() => handleToggleSelect(q.id)}
              onPreview={setPreviewQuestion}
              onEdit={handleEdit}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onActivate={handleActivate}
              onDelete={handleDelete}
              onResolveReport={handleResolveReport}
              isBusy={
                statusMutation.isPending ||
                publishMutation.isPending ||
                deleteMutation.isPending ||
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
