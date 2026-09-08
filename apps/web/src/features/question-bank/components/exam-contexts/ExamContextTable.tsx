"use client";

import { useState, useMemo } from "react";
import {
  Award,
  Plus,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { getErrorMessage } from "@/shared/utils";
import {
  ExamContextItem,
  ExamScope,
} from "../../types/question-bank.types";
import {
  useExamContexts,
  useDeleteExamContext,
} from "../../hooks/useExamContexts";
import { useAcademicYears } from "@/features/academic/academic-years";
import { ExamContextFormModal } from "./ExamContextFormModal";
import { ScopeBadge, ContextStatusBadge } from "./ExamContextBadges";
import { ContextRowActions } from "./ExamContextRowActions";
import { ConfirmDeleteModal } from "@/shared/components";

export function ExamContextTable() {
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<string>("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<ExamContextItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const { data: yearsResponse } = useAcademicYears();
  const academicYears = yearsResponse?.data ?? [];

  const { data, isLoading, error, isFetching } = useExamContexts({
    search: search.trim() || undefined,
    scope: scopeFilter === "ALL" ? undefined : (scopeFilter as ExamScope),
    year: yearFilter !== "ALL" && !isNaN(Number(yearFilter)) ? Number(yearFilter) : undefined,
    page,
    limit: 10,
  });

  const deleteMutation = useDeleteExamContext();

  const handleEdit = (context: ExamContextItem) => {
    setEditingContext(context);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingContext(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteErrorMessage(null);
    setDeleteTarget({ id, name });
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
          "Failed to delete exam type. If this exam type is linked to question banks or assessments, archive it instead."
        )
      );
    }
  };

  const items = data?.items ?? [];
  const meta = data?.meta;

  const toolbarFilters: readonly FilterGroup[] = useMemo(() => {
    const filters: FilterGroup[] = [
      {
        id: "scope",
        label: "Scope",
        icon: Filter,
        selectedValue: scopeFilter,
        onSelect: (val) => {
          setScopeFilter(val);
          setPage(1);
        },
        options: [
          { label: "All", value: "ALL" },
          { label: "National", value: "NATIONAL" },
          { label: "Regional", value: "REGIONAL" },
          { label: "School", value: "SCHOOL" },
          { label: "General", value: "GENERAL" },
        ],
      },
    ];

    if (academicYears.length > 0) {
      filters.push({
        id: "year",
        label: "Exam Year",
        icon: Calendar,
        selectedValue: yearFilter,
        onSelect: (val) => {
          setYearFilter(val);
          setPage(1);
        },
        options: [
          { label: "All", value: "ALL" },
          ...academicYears.map((ay) => ({
            label: ay.name,
            value: ay.name,
          })),
        ],
      });
    }

    return filters;
  }, [scopeFilter, yearFilter, academicYears]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <ErrorAlert message={error.message || "Failed to load exam types."} />
      </div>
    );
  }

  return (
    <div className="space-y-3.5 sm:space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder="Search exam types..."
          filters={toolbarFilters}
          actionButton={
            <button
              type="button"
              onClick={handleCreate}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Plus size={14} />
              <span>New Exam Type</span>
            </button>
          }
        />
      </div>

      {items.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <Award size={20} />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            No Exam Types Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            No exam types match the selected filters. Add a new exam type or adjust your filters.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus size={13} />
            <span>New Exam Type</span>
          </button>
        </div>
      ) : (
        <div className="w-full min-w-0">
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {items.map((ctx) => {
              const formattedDate = ctx.createdAt
                ? new Date(ctx.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              const bankCount = ctx.questionBankCount ?? ctx._count?.questionBanks ?? ctx.questionCount ?? 0;

              return (
                <div
                  key={ctx.id}
                  className="bg-card rounded-xl border border-border p-3.5 shadow-2xs hover:border-primary/40 transition-colors flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                        <Award size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <ScopeBadge scope={ctx.scope} />
                          <ContextStatusBadge status={ctx.status} />
                        </div>
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {ctx.name}
                        </h4>
                        {ctx.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {ctx.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ContextRowActions
                      context={ctx}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      isDeleting={deleteMutation.isPending && deleteTarget?.id === ctx.id}
                    />
                  </div>

                  <div className="pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium">
                      {ctx.year ? `${ctx.year} E.C.` : "All Years"} • {bankCount} Question Banks
                    </span>
                    <span>{formattedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block bg-card rounded-2xl border border-border shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Exam Type Name</th>
                    <th className="py-3 px-4">Scope</th>
                    <th className="py-3 px-3 text-center">Question Banks</th>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((ctx) => {
                    const formattedDate = ctx.createdAt
                      ? new Date(ctx.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—";

                    const bankCount = ctx.questionBankCount ?? ctx._count?.questionBanks ?? ctx.questionCount ?? 0;

                    return (
                      <tr
                        key={ctx.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-muted/70 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                              <Award size={14} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground text-xs truncate">
                                {ctx.name}
                              </div>
                              {ctx.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                  {ctx.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <ScopeBadge scope={ctx.scope} />
                        </td>

                        <td className="py-3.5 px-3 text-center font-medium text-foreground text-xs">
                          <span className="font-semibold px-2 py-0.5 rounded-md bg-muted border border-border text-foreground">
                            {bankCount}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-foreground font-medium text-xs">
                          {ctx.year ? `${ctx.year} E.C.` : "—"}
                        </td>

                        <td className="py-3.5 px-4">
                          <ContextStatusBadge status={ctx.status} />
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground text-xs">
                          {formattedDate}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <ContextRowActions
                            context={ctx}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            isDeleting={deleteMutation.isPending && deleteTarget?.id === ctx.id}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="bg-card rounded-2xl border border-border p-3 sm:px-4 flex items-center justify-between text-xs text-muted-foreground shadow-xs">
          <span>
            Page <strong className="text-foreground">{meta.page}</strong> of{" "}
            <strong className="text-foreground">{meta.totalPages}</strong> ({meta.total} total)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={meta.page <= 1 || isFetching}
              className="h-8 px-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 font-medium"
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, meta.totalPages))
              }
              disabled={meta.page >= meta.totalPages || isFetching}
              className="h-8 px-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 font-medium"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      <ExamContextFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingContext(null);
        }}
        initialData={editingContext}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteErrorMessage(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Exam Type"
        description="Are you sure you want to delete this exam type? This action cannot be undone."
        itemName={deleteTarget?.name}
        isPending={deleteMutation.isPending}
        errorMessage={deleteErrorMessage}
      />
    </div>
  );
}
