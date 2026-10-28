"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Filter,
  Calendar,
  Award,
} from "lucide-react";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { TableSkeleton } from "@/shared/components";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { SearchQueryProvider } from "@/shared/components/SearchHighlight";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { getErrorMessage } from "@/shared/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useMyTeacherAssignments } from "@/features/academic/assignments/teacher";
import {
  QuestionBankItem,
  QuestionBankStatus,
} from "../../types/question-bank.types";
import {
  useQuestionBanks,
  useUpdateQuestionBankStatus,
  useDeleteQuestionBank,
} from "../../hooks/useQuestionBanks";
import { useExamContexts } from "../../hooks/useExamContexts";
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
import { ConfirmDeleteModal } from "@/shared/components";

export function QuestionBankTable() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = Boolean(
    user?.roles?.includes("TEACHER") &&
      !user?.roles?.includes("SYSTEM_ADMIN") &&
      !user?.roles?.includes("SCHOOL_ADMIN")
  );
  const { allowedSubjectIds, allowedGradeIds } = useMyTeacherAssignments();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("ALL");
  const [examTypeFilter, setExamTypeFilter] = useState<string>("ALL");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("ALL");
  const [openSubjectIds, setOpenSubjectIds] = useState<Set<string>>(new Set());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<QuestionBankItem | null>(null);
  const [uploadBankId, setUploadBankId] = useState<string | null>(null);
  const [addQuestionBankId, setAddQuestionBankId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const { data: rawSubjectsList = [] } = useSubjects();
  const { data: rawGradesList = [] } = useGrades();
  const { data: yearsResponse } = useAcademicYears();
  const academicYears = yearsResponse?.data ?? [];
  const { data: examContextsData } = useExamContexts({ limit: 100 });
  const examContexts = examContextsData?.items ?? [];

  const effectiveGradesList = useMemo(() => {
    if (!isTeacher || allowedGradeIds.length === 0) return rawGradesList;
    return rawGradesList.filter((g) => allowedGradeIds.includes(g.id));
  }, [rawGradesList, isTeacher, allowedGradeIds]);

  const effectiveSubjectsList = useMemo(() => {
    if (!isTeacher || allowedSubjectIds.length === 0) return rawSubjectsList;
    return rawSubjectsList.filter((s) => allowedSubjectIds.includes(s.id));
  }, [rawSubjectsList, isTeacher, allowedSubjectIds]);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error } = useQuestionBanks({
    search: debouncedSearch.trim() || undefined,
    status: statusFilter === "ALL" ? undefined : (statusFilter as QuestionBankStatus),
    examContextId: examTypeFilter === "ALL" ? undefined : examTypeFilter,
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

  const handleDelete = (id: string, name: string) => {
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
          "Failed to delete question bank. If it contains questions or is linked to assessments, archive it instead."
        )
      );
    }
  };

  const rawItems = data?.items ?? [];

  const scopedItems = useMemo(() => {
    if (!isTeacher) return rawItems;
    if (allowedSubjectIds.length === 0 && allowedGradeIds.length === 0) return rawItems;
    return rawItems.filter((item) => {
      const matchSubject =
        !item.subjectId ||
        allowedSubjectIds.length === 0 ||
        allowedSubjectIds.includes(item.subjectId);
      const matchGrade =
        !item.gradeId ||
        allowedGradeIds.length === 0 ||
        allowedGradeIds.includes(item.gradeId);
      return matchSubject && matchGrade;
    });
  }, [rawItems, isTeacher, allowedSubjectIds, allowedGradeIds]);

  const gradeTabs: readonly QuestionGradeTabItem[] = useMemo(() => {
    return effectiveGradesList
      .slice()
      .sort((a, b) => a.level - b.level)
      .map((g) => {
        const count = scopedItems.filter(
          (item) => item.gradeId === g.id || item.grade?.level === g.level
        ).length;
        return {
          id: g.id,
          level: g.level,
          count,
        };
      });
  }, [effectiveGradesList, scopedItems]);

  const activeGrade = useMemo(() => {
    if (selectedGradeId === "ALL") return null;
    return effectiveGradesList.find((g) => g.id === selectedGradeId) || null;
  }, [effectiveGradesList, selectedGradeId]);

  const filteredByGradeItems = useMemo(() => {
    let list = scopedItems;
    if (activeGrade) {
      list = list.filter(
        (item) =>
          item.gradeId === activeGrade.id || item.grade?.level === activeGrade.level
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.subject?.name && item.subject.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [scopedItems, activeGrade, search]);

  const subjectGroups: readonly BankSubjectAccordionGroup[] = useMemo(() => {
    const map = new Map<string, QuestionBankItem[]>();
    const knownSubjects = new Map<string, { name: string; code?: string }>();

    for (const sub of effectiveSubjectsList) {
      knownSubjects.set(sub.id, { name: sub.name, code: sub.code });
      map.set(sub.id, []);
    }

    const unassigned: QuestionBankItem[] = [];

    for (const item of filteredByGradeItems) {
      if (item.subjectId && map.has(item.subjectId)) {
        map.get(item.subjectId)!.push(item);
      } else if (item.subjectId && !map.has(item.subjectId)) {
        if (!isTeacher || allowedSubjectIds.length === 0 || allowedSubjectIds.includes(item.subjectId)) {
          map.set(item.subjectId, [item]);
          knownSubjects.set(item.subjectId, {
            name: item.subject?.name || "Subject",
            code: item.subject?.code,
          });
        }
      } else if (item.subject?.name) {
        const found = Array.from(knownSubjects.entries()).find(
          ([, val]) => val.name.toLowerCase() === item.subject!.name.toLowerCase()
        );
        if (found) {
          map.get(found[0])!.push(item);
        } else if (!isTeacher) {
          unassigned.push(item);
        }
      } else if (!isTeacher) {
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
  }, [filteredByGradeItems, effectiveSubjectsList, selectedGradeId, isTeacher, allowedSubjectIds]);

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
          { label: "Active", value: "ACTIVE" },
          { label: "Draft", value: "DRAFT" },
          { label: "Archived", value: "ARCHIVED" },
        ],
      },
    ];

    if (academicYears.length > 0) {
      filters.push({
        id: "year",
        label: "Academic Year",
        icon: Calendar,
        selectedValue: academicYearFilter,
        onSelect: (val) => setAcademicYearFilter(val),
        options: academicYears.map((ay) => ({
          label: ay.name.replace(/Academic Year/i, "").trim() || ay.name,
          value: ay.id,
        })),
      });
    }

    if (examContexts.length > 0) {
      filters.push({
        id: "examType",
        label: "Exam Type",
        icon: Award,
        selectedValue: examTypeFilter,
        onSelect: (val) => setExamTypeFilter(val),
        options: examContexts.map((ec) => ({
          label: ec.name,
          value: ec.id,
        })),
      });
    }

    return filters;
  }, [statusFilter, academicYearFilter, examTypeFilter, academicYears, examContexts]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-none border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={(val) => setSearch(val)}
          searchPlaceholder="Search question banks..."
          filters={toolbarFilters}
          actionButton={
            <button
              type="button"
              onClick={handleCreate}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
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
        totalCount={scopedItems.length}
      />

      {isLoading && !data ? (
        <TableSkeleton rows={6} columns={5} hasToolbar={false} />
      ) : error ? (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <ErrorAlert message={error.message || "Failed to load question banks."} />
        </div>
      ) : filteredByGradeItems.length === 0 ? (
        <div className="bg-card rounded-none border border-border p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <BookOpen size={20} />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            No Question Banks Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            {isTeacher
              ? "No question banks found for your assigned subjects and grades. Create a new question bank or adjust your filters."
              : "No question banks match the selected filters. Add a new question bank or adjust your search filters."}
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
        <SearchQueryProvider query={search}>
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
        </SearchQueryProvider>
      )}

      <QuestionBankFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBank(null);
        }}
        initialData={editingBank}
        allowedSubjectIds={isTeacher ? allowedSubjectIds : undefined}
        allowedGradeIds={isTeacher ? allowedGradeIds : undefined}
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

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteErrorMessage(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Question Bank"
        description="Are you sure you want to delete this question bank? This action cannot be undone."
        itemName={deleteTarget?.name}
        isPending={deleteMutation.isPending}
        errorMessage={deleteErrorMessage}
      />
    </div>
  );
}
