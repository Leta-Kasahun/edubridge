"use client";

import { useState } from "react";
import {
  Plus,
  Layers,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import {
  CurriculumItem,
  CurriculumVersionItem,
  CurriculumFilters,
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
import { CurriculumImportModal } from "../../import";
import { useMemo } from "react";
import {
  TableToolbar,
  FilterGroup,
  LoadingSpinner,
  ErrorAlert,
  SearchQueryProvider,
  TableSkeleton,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useDebounce } from "@/shared/hooks/useDebounce";

export function CurriculaView() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = user?.roles?.includes("TEACHER");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<CurriculumFilters>({
    page: 1,
    limit: 10,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CurriculumItem | null>(null);
  const [detailItem, setDetailItem] = useState<CurriculumItem | null>(null);

  const [versionCurriculum, setVersionCurriculum] =
    useState<CurriculumItem | null>(null);
  const [versionToEdit, setVersionToEdit] =
    useState<CurriculumVersionItem | null>(null);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch.trim() || undefined,
    }),
    [filters, debouncedSearch]
  );

  const { data, isLoading, error, isFetching } = useCurricula(queryFilters);
  const changeStatusMutation = useChangeCurriculumStatus();

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleVersionSelect = (versionValue: string) => {
    setFilters((prev) => ({
      ...prev,
      version: versionValue === "ALL" ? undefined : versionValue,
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
    await changeStatusMutation.mutateAsync({ id: item.id, status });
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
      id: "version",
      label: "Version",
      selectedValue: filters.version || "ALL",
      onSelect: handleVersionSelect,
      icon: Layers,
      options: [
        { label: "All", value: "ALL" },
        { label: "V1", value: "V1" },
        { label: "V2", value: "V2" },
        { label: "V3", value: "V3" },
      ],
    },
    {
      id: "status",
      label: "Status",
      selectedValue: filters.status || "ALL",
      onSelect: handleStatusSelect,
      icon: CheckCircle2,
      options: [
        { label: "All", value: "ALL" },
        { label: "Active", value: "ACTIVE" },
        { label: "Draft", value: "DRAFT" },
        { label: "Archived", value: "ARCHIVED" },
      ],
    },
  ];

  return (
    <div className="space-y-3.5 sm:space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-none border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search curriculum name, code, or authority..."
          filters={filterGroups}
          actionButton={
            isTeacher ? undefined : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-none text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <Upload size={14} className="text-foreground" />
                  <span>Import</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 sm:h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <Plus size={14} />
                  <span>Curriculum</span>
                </button>
              </div>
            )
          }
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={6} hasToolbar={false} />
      ) : error ? (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <ErrorAlert message={getErrorMessage(error, "Failed to load curricula.")} />
        </div>
      ) : (
        <SearchQueryProvider query={search}>
          <CurriculaTable
            items={items}
            onViewDetails={(item) => setDetailItem(item)}
            onEdit={handleOpenEdit}
            onAddVersion={handleOpenAddVersion}
            onStatusChange={handleStatusChange}
            isUpdatingStatus={changeStatusMutation.isPending}
            isReadOnly={isTeacher}
          />
        </SearchQueryProvider>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="bg-card rounded-none border border-border p-3 sm:px-4 flex items-center justify-between text-xs text-muted-foreground shadow-xs">
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
              className="h-8 px-2.5 rounded-none border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 font-medium"
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
              className="h-8 px-2.5 rounded-none border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 font-medium"
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

      <CurriculumImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
