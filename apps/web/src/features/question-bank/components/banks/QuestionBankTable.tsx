"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Filter,
  Calendar,
  FolderTree,
  Copy,
  Check,
} from "lucide-react";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  QuestionBankItem,
  QuestionBankStatus,
} from "../../types/question-bank.types";
import {
  useQuestionBanks,
  useUpdateQuestionBankStatus,
  useDeleteQuestionBank,
} from "../../hooks/useQuestionBanks";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { useAcademicYears } from "@/features/academic/academic-years";
import { QuestionBankGradeTabs, QuestionGradeTabItem } from "./QuestionBankGradeTabs";
import {
  QuestionBankSubjectAccordion,
  BankSubjectAccordionGroup,
} from "./QuestionBankSubjectAccordion";
import { BankRowActions } from "./BankRowActions";
import { QuestionBankFormModal } from "./QuestionBankFormModal";
import { QuestionFormModal } from "../questions/QuestionFormModal";
import { QuestionUploadModal } from "../upload/QuestionUploadModal";

export function QuestionBankTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("ALL");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("ALL");
  const [openSubjectIds, setOpenSubjectIds] = useState<Set<string>>(new Set());
  const [copiedPath, setCopiedPath] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<QuestionBankItem | null>(null);
  const [uploadBankId, setUploadBankId] = useState<string | null>(null);
  const [addQuestionBankId, setAddQuestionBankId] = useState<string | null>(null);

  const { data: subjectsList = [] } = useSubjects();
  const { data: gradesList = [] } = useGrades();
  const { data: yearsResponse } = useAcademicYears();
  const academicYears = yearsResponse?.data ?? [];

  const { data, isLoading, error } = useQuestionBanks({
    search: search.trim() || undefined,
    status: statusFilter === "ALL" ? undefined : (statusFilter as QuestionBankStatus),
    limit: 100,
  });

  const statusMutation = useUpdateQuestionBankStatus();
  const deleteMutation = useDeleteQuestionBank();

  const handleEdit = (bank: QuestionBankItem) => {
    setEditingBank(bank);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingBank(null);
    setIsFormOpen(true);
  };

  const handleStatusChange = async (id: string, status: QuestionBankStatus) => {
    await statusMutation.mutateAsync({ id, status });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete question bank "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const rawItems = data?.items ?? [];

  const gradeTabs: readonly QuestionGradeTabItem[] = useMemo(() => {
    return gradesList
      .slice()
      .sort((a, b) => a.level - b.level)
      .map((g) => {
        const count = rawItems.filter(
          (item) => item.gradeId === g.id || item.grade?.level === g.level
        ).length;
        return {
          id: g.id,
          level: g.level,
          count,
        };
      });
  }, [gradesList, rawItems]);

  const activeGrade = useMemo(() => {
    if (selectedGradeId === "ALL") return null;
    return gradesList.find((g) => g.id === selectedGradeId) || null;
  }, [gradesList, selectedGradeId]);

  const filteredByGradeItems = useMemo(() => {
    if (!activeGrade) return rawItems;
    return rawItems.filter(
      (item) =>
        item.gradeId === activeGrade.id || item.grade?.level === activeGrade.level
    );
  }, [rawItems, activeGrade]);

  const activePathString = useMemo(() => {
    const parts = ["Question Banks"];
    if (activeGrade) {
      parts.push(`Grade ${activeGrade.level}`);
    } else {
      parts.push("All Grades");
    }
    if (statusFilter !== "ALL") {
      parts.push(statusFilter);
    }
    return parts.join(" / ");
  }, [activeGrade, statusFilter]);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(activePathString);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const subjectGroups: readonly BankSubjectAccordionGroup[] = useMemo(() => {
    const map = new Map<string, QuestionBankItem[]>();
    const knownSubjects = new Map<string, { name: string; code?: string }>();

    for (const sub of subjectsList) {
      knownSubjects.set(sub.id, { name: sub.name, code: sub.code });
      map.set(sub.id, []);
    }

    const unassigned: QuestionBankItem[] = [];

    for (const item of filteredByGradeItems) {
      if (item.subjectId && map.has(item.subjectId)) {
        map.get(item.subjectId)!.push(item);
      } else if (item.subjectId && !map.has(item.subjectId)) {
        map.set(item.subjectId, [item]);
        knownSubjects.set(item.subjectId, {
          name: item.subject?.name || "Subject",
          code: item.subject?.code,
        });
      } else if (item.subject?.name) {
        const found = Array.from(knownSubjects.entries()).find(
          ([, val]) => val.name.toLowerCase() === item.subject!.name.toLowerCase()
        );
        if (found) {
          map.get(found[0])!.push(item);
        } else {
          unassigned.push(item);
        }
      } else {
        unassigned.push(item);
      }
    }

    const result: BankSubjectAccordionGroup[] = [];

    for (const [id, subjectInfo] of knownSubjects.entries()) {
      const groupBanks = map.get(id) || [];
      if (groupBanks.length > 0 || selectedGradeId !== "ALL") {
        result.push({
          id,
          name: subjectInfo.name,
          code: subjectInfo.code,
          banks: groupBanks,
        });
      }
    }

    result.sort((a, b) => a.name.localeCompare(b.name));

    if (unassigned.length > 0) {
      result.push({
        id: "general-banks",
        name: "General & Cross-Subject Question Banks",
        code: "GEN",
        banks: unassigned,
      });
    }

    return result;
  }, [filteredByGradeItems, subjectsList, selectedGradeId]);

  useEffect(() => {
    if (subjectGroups.length > 0 && openSubjectIds.size === 0) {
      const firstWithBanks =
        subjectGroups.find((g) => g.banks.length > 0) || subjectGroups[0];
      if (firstWithBanks) {
        setOpenSubjectIds(new Set([firstWithBanks.id]));
      }
    }
  }, [subjectGroups, openSubjectIds.size]);

  const handleToggleSubject = (id: string) => {
    setOpenSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toolbarFilters: readonly FilterGroup[] = useMemo(() => {
    const filters: FilterGroup[] = [
      {
        id: "status",
        label: "Status",
        icon: Filter,
        selectedValue: statusFilter,
        onSelect: (val) => setStatusFilter(val),
        options: [
          { label: "All", value: "ALL" },
          { label: "Active", value: "ACTIVE" },
          { label: "Draft", value: "DRAFT" },
          { label: "Archived", value: "ARCHIVED" },
        ],
      },
    ];

    if (academicYears.length > 0) {
      filters.push({
        id: "year",
        label: "Year",
        icon: Calendar,
        selectedValue: academicYearFilter,
        onSelect: (val) => setAcademicYearFilter(val),
        options: [
          { label: "All", value: "ALL" },
          ...academicYears.map((ay) => ({
            label: ay.name.replace(/Academic Year/i, "").trim() || ay.name,
            value: ay.id,
          })),
        ],
      });
    }

    return filters;
  }, [statusFilter, academicYearFilter, academicYears]);

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
        <ErrorAlert message={error.message || "Failed to load question banks."} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
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
            {filteredByGradeItems.length}{" "}
            {filteredByGradeItems.length === 1 ? "bank" : "banks"}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={(val) => setSearch(val)}
          searchPlaceholder="Search question banks..."
          filters={toolbarFilters}
          actionButton={
            <button
              type="button"
              onClick={handleCreate}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Plus size={14} />
              <span>Create Question Bank</span>
            </button>
          }
        />
      </div>

      <QuestionBankGradeTabs
        grades={gradeTabs}
        selectedGradeId={selectedGradeId}
        onSelectGrade={(id) => setSelectedGradeId(id)}
        totalCount={rawItems.length}
      />

      {rawItems.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <BookOpen size={20} />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            No Question Banks Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            No question banks match the selected filters. Add a new question bank or adjust your search filters.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus size={13} />
            <span>Create Question Bank</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {subjectGroups.map((group) => (
            <QuestionBankSubjectAccordion
              key={group.id}
              group={group}
              isOpen={openSubjectIds.has(group.id)}
              onToggle={() => handleToggleSubject(group.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
              renderRowActions={(bank) => (
                <BankRowActions
                  bank={bank}
                  onEdit={handleEdit}
                  onUpload={(b) => setUploadBankId(b.id)}
                  onAddQuestion={(b) => setAddQuestionBankId(b.id)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  isBusy={deleteMutation.isPending || statusMutation.isPending}
                />
              )}
            />
          ))}
        </div>
      )}

      <QuestionBankFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBank(null);
        }}
        initialData={editingBank}
      />

      {uploadBankId && (
        <QuestionUploadModal
          bankId={uploadBankId}
          isOpen={Boolean(uploadBankId)}
          onClose={() => setUploadBankId(null)}
        />
      )}

      {addQuestionBankId && (
        <QuestionFormModal
          bankId={addQuestionBankId}
          isOpen={Boolean(addQuestionBankId)}
          onClose={() => setAddQuestionBankId(null)}
        />
      )}
    </div>
  );
}
