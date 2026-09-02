"use client";

import { useState } from "react";
import {
  Plus,
  Globe,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  CurriculumItem,
  CurriculumVersionItem,
  CurriculumFilters,
  CurriculumScope,
  CurriculumStatus,
} from "../types/curriculum.types";
import {
  useCurricula,
  useChangeCurriculumStatus,
} from "../hooks/useCurricula";
import { CurriculaTable } from "./CurriculaTable";
import { CurriculumFormModal } from "./CurriculumFormModal";
import { CurriculumDetailModal } from "./CurriculumDetailModal";
import { CurriculumVersionFormModal } from "./CurriculumVersionFormModal";
import {
  TableToolbar,
  FilterGroup,
  LoadingSpinner,
  ErrorAlert,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

export function CurriculaView() {
  const [filters, setFilters] = useState<CurriculumFilters>({
    page: 1,
    limit: 10,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CurriculumItem | null>(null);
  const [detailItem, setDetailItem] = useState<CurriculumItem | null>(null);

  const [versionCurriculum, setVersionCurriculum] =
    useState<CurriculumItem | null>(null);
  const [versionToEdit, setVersionToEdit] =
    useState<CurriculumVersionItem | null>(null);

  const { data, isLoading, error, isFetching } = useCurricula(filters);
  const changeStatusMutation = useChangeCurriculumStatus("");

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search || undefined,
      page: 1,
    }));
  };

  const handleScopeSelect = (scopeValue: string) => {
    setFilters((prev) => ({
      ...prev,
      scope:
        scopeValue === "ALL" ? undefined : (scopeValue as CurriculumScope),
      page: 1,
    }));
  };

  const handleStatusSelect = (statusValue: string) => {
    setFilters((prev) => ({
      ...prev,
      status:
        statusValue === "ALL"
          ? undefined
          : (statusValue as CurriculumStatus),
      page: 1,
    }));
  };

  const handleStatusChange = async (
    item: CurriculumItem,
    status: CurriculumStatus
  ) => {
    await changeStatusMutation.mutateAsync(status);
  };

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (item: CurriculumItem) => {
    setItemToEdit(item);
    setIsCreateModalOpen(true);
  };

  const handleOpenAddVersion = (item: CurriculumItem) => {
    setVersionCurriculum(item);
    setVersionToEdit(null);
  };

  const handleOpenEditVersion = (
    curriculum: CurriculumItem,
    version: CurriculumVersionItem
  ) => {
    setVersionCurriculum(curriculum);
    setVersionToEdit(version);
  };

  const filterGroups: readonly FilterGroup[] = [
    {
      id: "scope",
      label: "Scope",
      selectedValue: filters.scope || "ALL",
      onSelect: handleScopeSelect,
      icon: Globe,
      options: [
        { label: "All Scopes", value: "ALL" },
        { label: "National System", value: "SYSTEM" },
        { label: "School Custom", value: "TENANT" },
      ],
    },
    {
      id: "status",
      label: "Status",
      selectedValue: filters.status || "ALL",
      onSelect: handleStatusSelect,
      icon: CheckCircle2,
      options: [
        { label: "All Statuses", value: "ALL" },
        { label: "Active", value: "ACTIVE" },
        { label: "Draft", value: "DRAFT" },
        { label: "Archived", value: "ARCHIVED" },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorAlert message={getErrorMessage(error, "Failed to load curricula.")} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={filters.search || ""}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search curriculum name, code, or authority..."
          filters={filterGroups}
          actionButton={
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Plus size={14} />
              <span>Add Curriculum</span>
            </button>
          }
        />
      </div>

      <CurriculaTable
        items={items}
        onViewDetails={(item) => setDetailItem(item)}
        onEdit={handleOpenEdit}
        onAddVersion={handleOpenAddVersion}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={changeStatusMutation.isPending}
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
                  page: Math.min(
                    (prev.page || 1) + 1,
                    pagination.totalPages
                  ),
                }))
              }
              disabled={
                pagination.page >= pagination.totalPages || isFetching
              }
              className="h-8 px-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 font-medium"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CurriculumFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setItemToEdit(null);
        }}
        itemToEdit={itemToEdit}
      />

      <CurriculumDetailModal
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        curriculumItem={detailItem}
        onAddVersion={handleOpenAddVersion}
        onEditVersion={handleOpenEditVersion}
      />

      <CurriculumVersionFormModal
        isOpen={Boolean(versionCurriculum)}
        onClose={() => {
          setVersionCurriculum(null);
          setVersionToEdit(null);
        }}
        curriculum={versionCurriculum}
        versionToEdit={versionToEdit}
      />
    </div>
  );
}
