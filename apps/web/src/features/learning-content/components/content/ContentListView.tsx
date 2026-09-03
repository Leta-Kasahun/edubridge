"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  LearningContentListItem,
  LearningContentDetailItem,
  ContentFilters,
  ContentType,
  ContentStatus,
} from "../../types/content.types";
import {
  useContentList,
  useSubmitContent,
  usePublishContent,
  useArchiveContent,
  useDeleteContent,
} from "../../hooks/useLearningContent";
import { ContentTable } from "./ContentTable";
import { ContentFormModal } from "./ContentFormModal";
import { ContentVersionModal } from "./ContentVersionModal";
import { ContentDetailModal } from "./ContentDetailModal";
import {
  TableToolbar,
  FilterGroup,
  LoadingSpinner,
  ErrorAlert,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

const TYPE_FILTER_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "LESSON", label: "Lesson" },
  { value: "PDF", label: "PDF Document" },
  { value: "VIDEO", label: "Video" },
  { value: "NOTE", label: "Note" },
  { value: "IMAGE", label: "Image" },
  { value: "LINK", label: "Resource Link" },
  { value: "TEXT", label: "Text" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] =
    useState<LearningContentListItem | null>(null);
  const [detailItem, setDetailItem] =
    useState<LearningContentListItem | null>(null);
  const [versionTargetItem, setVersionTargetItem] =
    useState<LearningContentListItem | LearningContentDetailItem | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const { data, isLoading, error, isFetching } = useContentList(filters);
  const submitMutation = useSubmitContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();
  const deleteMutation = useDeleteContent();

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search || undefined,
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
    if (
      !confirm(
        `Are you sure you want to delete material "${item.title}"?`
      )
    )
      return;
    await deleteMutation.mutateAsync(item.id);
  };

  const filterGroups: FilterGroup[] = [
    {
      id: "type",
      label: "Type",
      options: TYPE_FILTER_OPTIONS,
      selectedValue: filters.type || "ALL",
      onSelect: handleTypeSelect,
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
    <div className="space-y-3.5 sm:space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={filters.search || ""}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search materials by title, description..."
          filters={filterGroups}
          actionButton={
            <button
              type="button"
              onClick={handleOpenAdd}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 sm:h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Plus size={14} />
              <span>Material</span>
            </button>
          }
        />
      </div>

      <ContentTable
        items={items}
        onViewDetail={(item) => setDetailItem(item)}
        onEdit={handleOpenEdit}
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
    </div>
  );
}
