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
  Binary,
  Calendar,
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
} from "../../hooks/useQuestions";
import { useQuestionBank } from "../../hooks/useQuestionBanks";
import { QuestionTypeBadge, QuestionDifficultyBadge, QuestionStatusBadge } from "./QuestionBadges";
import { QuestionRowActions } from "./QuestionRowActions";
import { QuestionFormModal } from "./QuestionFormModal";
import { QuestionPreviewModal } from "./QuestionPreviewModal";
import { QuestionUploadModal } from "../upload/QuestionUploadModal";

interface QuestionListViewProps {
  readonly bankId: string;
}

export function QuestionListView({ bankId }: QuestionListViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionListItem | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionListItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: bank, isLoading: isBankLoading } = useQuestionBank(bankId);
  const { data: questionsData, isLoading: isQuestionsLoading, error } = useQuestions(
    bankId,
    {
      search: search.trim() || undefined,
      type: typeFilter === "ALL" ? undefined : (typeFilter as QuestionType),
      difficulty:
        difficultyFilter === "ALL"
          ? undefined
          : (difficultyFilter as DifficultyLevel),
      status:
        statusFilter === "ALL" ? undefined : (statusFilter as QuestionStatus),
      page,
      limit: 20,
    }
  );

  const statusMutation = useUpdateQuestionStatus(bankId);
  const publishMutation = usePublishQuestion(bankId);
  const deleteMutation = useDeleteQuestion(bankId);

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

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete question "${code}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const items = questionsData?.items ?? [];

  const toolbarFilters: readonly FilterGroup[] = useMemo(() => {
    return [
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
      },
    ];
  }, [typeFilter, difficultyFilter, statusFilter]);

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
          </div>
          {bank?.description && (
            <p className="text-xs text-muted-foreground max-w-2xl line-clamp-2">
              {bank.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
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
            Add your first question manually or upload an exam document to extract questions automatically.
          </p>
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
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((question) => {
            const formattedDate = question.createdAt
              ? new Date(question.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
              : "—";

            return (
              <div
                key={question.id}
                className="bg-card rounded-2xl border border-border p-4 shadow-2xs hover:border-primary/40 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <QuestionTypeBadge type={question.type} />
                      <QuestionDifficultyBadge difficulty={question.difficulty} />
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
                        {question.defaultPoints} pt{question.defaultPoints === 1 ? "" : "s"}
                      </span>
                      <QuestionStatusBadge status={question.status} />
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
                        <Calendar size={12} />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-foreground break-words line-clamp-3">
                      {question.prompt}
                    </p>
                  </div>

                  <QuestionRowActions
                    question={question}
                    onPreview={(q) => setPreviewQuestion(q)}
                    onEdit={handleEdit}
                    onPublish={handlePublish}
                    onArchive={handleArchive}
                    onActivate={handleActivate}
                    onDelete={handleDelete}
                    isBusy={publishMutation.isPending || deleteMutation.isPending || statusMutation.isPending}
                  />
                </div>

                {question.options && question.options.length > 0 && (
                  <div className="pt-2.5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {question.options.slice(0, 4).map((opt, idx) => (
                      <div
                        key={opt.id || idx}
                        className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 ${opt.isCorrect
                            ? "bg-muted/70 border-foreground/20 text-foreground font-medium"
                            : "bg-card border-border text-muted-foreground"
                          }`}
                      >
                        <span className="font-mono text-[11px] opacity-70">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span className="truncate">{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
      />

      <QuestionUploadModal
        bankId={bankId}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
