"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Copy,
  Check,
  Trash2,
  Send,
  CheckCircle,
} from "lucide-react";
import {
  LearningContentListItem,
  LearningContentDetailItem,
  ContentFilters,
  ContentType,
  ContentScope,
  ContentStatus,
} from "../../types/content.types";
import {
  useContentList,
  useSubmitContent,
  usePublishContent,
  useArchiveContent,
  useDeleteContent,
} from "../../hooks/useLearningContent";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { ContentTable } from "./ContentTable";
import { ContentFormModal } from "./ContentFormModal";
import { ContentVersionModal } from "./ContentVersionModal";
import { ContentDetailModal } from "./ContentDetailModal";
import { ContentUploadModal } from "./ContentUploadModal";
import {
  TableToolbar,
  FilterGroup,
  LoadingSpinner,
  ErrorAlert,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

const SCOPE_FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "SUBJECT", label: "Subject" },
  { value: "GRADE_SUBJECT", label: "Grade" },
  { value: "UNIT", label: "Unit" },
  { value: "TOPIC", label: "Topic" },
];

const TYPE_FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "TEXTBOOK", label: "Textbook" },
  { value: "REFERENCE_BOOK", label: "Reference Book" },
  { value: "WORKSHEET", label: "Worksheet" },
  { value: "LESSON", label: "Lesson" },
  { value: "EXERCISE", label: "Exercise" },
  { value: "PAST_EXAM_PAPER", label: "Past Exam" },
  { value: "TEACHER_GUIDE", label: "Teacher Guide" },
  { value: "STUDY_GUIDE", label: "Study Guide" },
  { value: "VIDEO", label: "Video" },
  { value: "PDF", label: "PDF" },
  { value: "NOTE", label: "Note" },
  { value: "IMAGE", label: "Image" },
  { value: "LINK", label: "Link" },
  { value: "TEXT", label: "Text" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "In Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export function ContentListView() {
  const [filters, setFilters] = useState<ContentFilters>({
    page: 1,
    limit: 10,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedPath, setCopiedPath] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] =
    useState<LearningContentListItem | null>(null);
  const [detailItem, setDetailItem] =
    useState<LearningContentListItem | null>(null);
  const [versionTargetItem, setVersionTargetItem] =
    useState<LearningContentListItem | LearningContentDetailItem | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [uploadTargetItem, setUploadTargetItem] =
    useState<LearningContentListItem | null>(null);

  const { data, isLoading, error, isFetching } = useContentList(filters);
  const { data: subjects = [] } = useSubjects();
  const { data: grades = [] } = useGrades();

  const submitMutation = useSubmitContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();
  const deleteMutation = useDeleteContent();

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const subjectFilterOptions = useMemo(() => [
    { value: "ALL", label: "All" },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ], [subjects]);

  const gradeFilterOptions = useMemo(() => [
    { value: "ALL", label: "All" },
    ...grades.map((g) => ({ value: g.id, label: `Grade ${g.level}` })),
  ], [grades]);

  const activePathString = useMemo(() => {
    const parts = ["Materials"];

    if (filters.subjectId) {
      const matchedSub = subjects.find((s) => s.id === filters.subjectId);
      if (matchedSub) {
        parts.push(matchedSub.name);
      }
    }

    if (filters.gradeId) {
      const matchedGrade = grades.find((g) => g.id === filters.gradeId);
      if (matchedGrade) {
        parts.push(`Grade ${matchedGrade.level}`);
      }
    }

    if (filters.scope) {
      const scopeMap: Record<string, string> = {
        SUBJECT: "Subject",
        GRADE_SUBJECT: "Grade",
        UNIT: "Unit",
        TOPIC: "Topic",
      };
      parts.push(scopeMap[filters.scope] || filters.scope);
    }

    return parts.join(" / ");
  }, [filters, subjects, grades]);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(activePathString);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search || undefined,
      page: 1,
    }));
  };

  const handleScopeSelect = (scopeVal: string) => {
    setFilters((prev) => ({
      ...prev,
      scope: scopeVal === "ALL" ? undefined : (scopeVal as ContentScope),
      page: 1,
    }));
  };

  const handleTypeSelect = (typeVal: string) => {
    setFilters((prev) => ({
      ...prev,
      type: typeVal === "ALL" ? undefined : (typeVal as ContentType),
      page: 1,
    }));
  };

  const handleStatusSelect = (statusVal: string) => {
    setFilters((prev) => ({
      ...prev,
      status: statusVal === "ALL" ? undefined : (statusVal as ContentStatus),
      page: 1,
    }));
  };

  const handleSubjectSelect = (subVal: string) => {
    setFilters((prev) => ({
      ...prev,
      subjectId: subVal === "ALL" ? undefined : subVal,
      page: 1,
    }));
  };

  const handleGradeSelect = (gradeVal: string) => {
    setFilters((prev) => ({
      ...prev,
      gradeId: gradeVal === "ALL" ? undefined : gradeVal,
      page: 1,
    }));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
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
    if (items.length === 0) return;
    const allSelected = items.every((i) => selectedIds.has(i.id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (item: LearningContentListItem) => {
    setItemToEdit(item);
    setIsCreateModalOpen(true);
  };

  const handleOpenNewVersion = (
    item: LearningContentListItem | LearningContentDetailItem
  ) => {
    setVersionTargetItem(item);
    setIsVersionModalOpen(true);
  };

  const handleDelete = async (item: LearningContentListItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }
    await deleteMutation.mutateAsync(item.id);
  };

  const handleBatchSubmit = async () => {
    for (const id of selectedIds) {
      await submitMutation.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  const handleBatchPublish = async () => {
    for (const id of selectedIds) {
      await publishMutation.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  const handleBatchDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected materials?`)) {
      return;
    }
    for (const id of selectedIds) {
      await deleteMutation.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  const filterGroups: FilterGroup[] = [
    {
      id: "scope",
      label: "Scope",
      options: SCOPE_FILTER_OPTIONS,
      selectedValue: filters.scope || "ALL",
      onSelect: handleScopeSelect,
    },
    {
      id: "type",
      label: "Type",
      options: TYPE_FILTER_OPTIONS,
      selectedValue: filters.type || "ALL",
      onSelect: handleTypeSelect,
    },
    {
      id: "subject",
      label: "Subject",
      options: subjectFilterOptions,
      selectedValue: filters.subjectId || "ALL",
      onSelect: handleSubjectSelect,
    },
    {
      id: "grade",
      label: "Grade",
      options: gradeFilterOptions,
      selectedValue: filters.gradeId || "ALL",
      onSelect: handleGradeSelect,
    },
    {
      id: "status",
      label: "Status",
      options: STATUS_FILTER_OPTIONS,
      selectedValue: filters.status || "ALL",
      onSelect: handleStatusSelect,
    },
  ];

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <ErrorAlert message={getErrorMessage(error, "Failed to load learning materials.")} />
      </div>
    );
  }

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-xl border border-border px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <FolderTree size={14} className="text-muted-foreground shrink-0" />
          <span className="font-mono text-[11px] text-muted-foreground truncate">
            {activePathString}
          </span>
          <button
            type="button"
            onClick={handleCopyPath}
            title="Copy path"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
          >
            {copiedPath ? (
              <Check size={12} className="text-emerald-500" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-muted-foreground hidden sm:inline font-medium">
            {pagination ? `${pagination.total} materials` : ""}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={filters.search || ""}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search materials..."
          filters={filterGroups}
          actionButton={
            <button
              type="button"
              onClick={handleOpenAdd}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Plus size={14} />
              <span>New Material</span>
            </button>
          }
        />
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-3.5 py-2 flex items-center justify-between gap-3 text-xs animate-in fade-in-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-muted-foreground hover:text-foreground underline cursor-pointer text-[11px]"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleBatchSubmit}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Send size={11} className="text-amber-500" />
              <span>Submit</span>
            </button>
            <button
              type="button"
              onClick={handleBatchPublish}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <CheckCircle size={11} className="text-emerald-500" />
              <span>Publish</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors cursor-pointer"
            >
              <Trash2 size={11} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      <ContentTable
        items={items}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onViewDetail={(item) => setDetailItem(item)}
        onEdit={handleOpenEdit}
        onOpenUpload={(item) => setUploadTargetItem(item)}
        onSaveNewVersion={handleOpenNewVersion}
        onSubmitForReview={(item) => submitMutation.mutate(item.id)}
        onPublish={(item) => publishMutation.mutate(item.id)}
        onArchive={(item) => archiveMutation.mutate(item.id)}
        onDelete={handleDelete}
        onOpenAddModal={handleOpenAdd}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="bg-card rounded-2xl border border-border p-3 sm:px-4 flex items-center justify-between text-xs text-muted-foreground shadow-xs">
          <span>
            Page <strong className="text-foreground">{pagination.page}</strong> of{" "}
            <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.total} total)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max((prev.page || 1) - 1, 1),
                }))
              }
              disabled={pagination.page <= 1 || isFetching}
              className="h-8 px-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 font-medium"
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min((prev.page || 1) + 1, pagination.totalPages),
                }))
              }
              disabled={pagination.page >= pagination.totalPages || isFetching}
              className="h-8 px-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 font-medium"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      <ContentFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setItemToEdit(null);
        }}
        itemToEdit={itemToEdit}
      />

      <ContentVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => {
          setIsVersionModalOpen(false);
          setVersionTargetItem(null);
        }}
        item={versionTargetItem}
      />

      <ContentDetailModal
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        item={detailItem}
        onOpenNewVersionModal={(item) => {
          setDetailItem(null);
          handleOpenNewVersion(item);
        }}
      />

      <ContentUploadModal
        isOpen={Boolean(uploadTargetItem)}
        onClose={() => setUploadTargetItem(null)}
        item={uploadTargetItem}
      />
    </div>
  );
}
