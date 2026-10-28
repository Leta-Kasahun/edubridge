"use client";

import { useState, useMemo, useEffect } from "react";
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
  RotateCcw,
  Calendar,
  BookOpen,
  ShieldCheck,
  Folder,
  Sparkles,
} from "lucide-react";
import { AiGenerateContentModal } from "@/features/ai";
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
  useApproveContent,
  usePublishContent,
  useArchiveContent,
  useActivateContent,
  useDeleteContent,
} from "../../hooks/useLearningContent";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { useAcademicYears } from "@/features/academic/academic-years/hooks/useAcademicYears";
import { ContentGradeTabs, GradeTabItem } from "./ContentGradeTabs";
import {
  ContentSubjectAccordion,
  SubjectAccordionGroup,
} from "./ContentSubjectAccordion";
import { ContentFormModal } from "./ContentFormModal";
import { ContentVersionModal } from "./ContentVersionModal";
import { ContentDetailModal } from "./ContentDetailModal";
import { ContentUploadModal } from "./ContentUploadModal";
import {
  TableToolbar,
  FilterGroup,
  LoadingSpinner,
  ErrorAlert,
  ConfirmDeleteModal,
  SearchQueryProvider,
} from "@/shared/components";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { getErrorMessage } from "@/shared/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useMyTeacherAssignments } from "@/features/academic/assignments/teacher";

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
    limit: 50,
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setFilters((prev) => {
      const nextSearch = debouncedSearch.trim() || undefined;
      if (prev.search === nextSearch) return prev;
      return {
        ...prev,
        search: nextSearch,
        page: 1,
      };
    });
  }, [debouncedSearch]);

  const [selectedGradeId, setSelectedGradeId] = useState<string>("ALL");
  const [selectedAcademicYearId, setSelectedAcademicYearId] =
    useState<string>("ALL");
  const [openSubjectIds, setOpenSubjectIds] = useState<Set<string>>(new Set());

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
  const [isAiDraftModalOpen, setIsAiDraftModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    readonly type: "single" | "batch";
    readonly id?: string;
    readonly title?: string;
    readonly count?: number;
  } | null>(null);

  const user = useAuthStore((s) => s.user);
  const isTeacher = Boolean(
    user?.roles?.includes("TEACHER") &&
      !user?.roles?.includes("SCHOOL_ADMIN") &&
      !user?.roles?.includes("SYSTEM_ADMIN")
  );
  const { allowedSubjectIds, allowedGradeIds } = useMyTeacherAssignments();

  const { data, isLoading, error, isFetching, refetch } = useContentList(filters);
  const { data: subjects = [] } = useSubjects();
  const { data: grades = [] } = useGrades();
  const { data: academicYearsData } = useAcademicYears();

  const academicYears = academicYearsData?.data ?? [];

  const submitMutation = useSubmitContent();
  const approveMutation = useApproveContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();
  const activateMutation = useActivateContent();
  const deleteMutation = useDeleteContent();

  const rawItems = data?.data ?? [];
  const pagination = data?.pagination;

  const items = useMemo(() => {
    if (!isTeacher) return rawItems;
    if (allowedSubjectIds.length === 0 && allowedGradeIds.length === 0) return rawItems;
    return rawItems.filter((item) => {
      const isAuthor = Boolean(user?.id && item.authorId === user.id);
      const matchSubject = !item.subjectId || allowedSubjectIds.includes(item.subjectId);
      const matchGrade = !item.gradeId || allowedGradeIds.includes(item.gradeId);
      return isAuthor || (matchSubject && matchGrade);
    });
  }, [rawItems, isTeacher, allowedSubjectIds, allowedGradeIds, user?.id]);

  const gradeTabs: readonly GradeTabItem[] = useMemo(() => {
    const visibleGradesList =
      isTeacher && allowedGradeIds.length > 0
        ? grades.filter((g) => allowedGradeIds.includes(g.id))
        : grades;

    return visibleGradesList
      .slice()
      .sort((a, b) => a.level - b.level)
      .map((g) => {
        const count = items.filter(
          (item) =>
            item.gradeId === g.id ||
            item.gradeLevel === g.level ||
            (item.targetGradeLevels && item.targetGradeLevels.includes(g.level))
        ).length;
        return {
          id: g.id,
          level: g.level,
          count,
        };
      });
  }, [grades, items, isTeacher, allowedGradeIds]);

  const activeGrade = useMemo(() => {
    if (selectedGradeId === "ALL") return null;
    return grades.find((g) => g.id === selectedGradeId) || null;
  }, [grades, selectedGradeId]);

  const filteredByGradeItems = useMemo(() => {
    let list = items;
    if (activeGrade) {
      list = list.filter(
        (item) =>
          item.gradeId === activeGrade.id ||
          item.gradeLevel === activeGrade.level ||
          (item.targetGradeLevels &&
            item.targetGradeLevels.includes(activeGrade.level))
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.subjectName && item.subjectName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, activeGrade, search]);

  const subjectGroups: readonly SubjectAccordionGroup[] = useMemo(() => {
    const map = new Map<string, LearningContentListItem[]>();
    const knownSubjects = new Map<string, { name: string; code: string }>();

    const visibleSubjectsList =
      isTeacher && allowedSubjectIds.length > 0
        ? subjects.filter((s) => allowedSubjectIds.includes(s.id))
        : subjects;

    for (const sub of visibleSubjectsList) {
      knownSubjects.set(sub.id, { name: sub.name, code: sub.code });
      map.set(sub.id, []);
    }

    const unassigned: LearningContentListItem[] = [];

    for (const item of filteredByGradeItems) {
      if (item.subjectId && map.has(item.subjectId)) {
        map.get(item.subjectId)!.push(item);
      } else if (item.subjectId && !map.has(item.subjectId)) {
        if (!isTeacher || allowedSubjectIds.includes(item.subjectId)) {
          map.set(item.subjectId, [item]);
          knownSubjects.set(item.subjectId, {
            name: item.subjectName || "Subject",
            code: "",
          });
        }
      } else if (item.subjectName) {
        const found = Array.from(knownSubjects.entries()).find(
          ([, val]) => val.name.toLowerCase() === item.subjectName!.toLowerCase()
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

    const result: SubjectAccordionGroup[] = [];

    for (const [id, subjectInfo] of knownSubjects.entries()) {
      const groupMaterials = map.get(id) || [];
      if (groupMaterials.length > 0 || selectedGradeId !== "ALL") {
        result.push({
          id,
          name: subjectInfo.name,
          code: subjectInfo.code,
          materials: groupMaterials,
        });
      }
    }

    result.sort((a, b) => a.name.localeCompare(b.name));

    if (unassigned.length > 0 && !isTeacher) {
      result.push({
        id: "general-resources",
        name: "General & Cross-Subject Resources",
        code: "GEN",
        materials: unassigned,
      });
    }

    return result;
  }, [filteredByGradeItems, subjects, selectedGradeId, isTeacher, allowedSubjectIds]);

  useEffect(() => {
    if (subjectGroups.length > 0 && openSubjectIds.size === 0) {
      const firstWithMaterials =
        subjectGroups.find((g) => g.materials.length > 0) || subjectGroups[0];
      if (firstWithMaterials) {
        setOpenSubjectIds(new Set([firstWithMaterials.id]));
      }
    }
  }, [subjectGroups, openSubjectIds.size]);

  const activePathString = useMemo(() => {
    const parts = ["Materials"];

    if (activeGrade) {
      parts.push(`Grade ${activeGrade.level}`);
    } else {
      parts.push("All Grades");
    }

    if (filters.type) {
      parts.push(filters.type);
    }

    return parts.join(" / ");
  }, [activeGrade, filters.type]);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(activePathString);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
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

  const handleSelectGradeTab = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedIds(new Set());
  };

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

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenAddForSubject = () => {
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

  const handleDelete = (item: LearningContentListItem) => {
    setDeleteTarget({
      type: "single",
      id: item.id,
      title: item.title,
    });
  };

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  const submittableSelectedItems = useMemo(() => {
    return selectedItems.filter((item) => {
      const isAuthor = Boolean(user?.id && item.authorId === user.id);
      return item.status === "DRAFT" && (isAuthor || !isTeacher);
    });
  }, [selectedItems, user?.id, isTeacher]);

  const publishableSelectedItems = useMemo(() => {
    return selectedItems.filter((item) => {
      const isAuthor = Boolean(user?.id && item.authorId === user.id);
      const isTextbookOrRef = item.type === "TEXTBOOK" || item.type === "REFERENCE_BOOK";
      if (!isTeacher) {
        return (
          item.status === "APPROVED" ||
          item.status === "PENDING_REVIEW" ||
          (!isTextbookOrRef && item.status === "DRAFT")
        );
      }
      return (
        (!isTextbookOrRef && item.status === "DRAFT" && isAuthor) ||
        (isTextbookOrRef && item.status === "APPROVED" && isAuthor)
      );
    });
  }, [selectedItems, user?.id, isTeacher]);

  const activatableSelectedItems = useMemo(() => {
    return selectedItems.filter((item) => {
      const isAuthor = Boolean(user?.id && item.authorId === user.id);
      return item.status === "ARCHIVED" && (isAuthor || !isTeacher);
    });
  }, [selectedItems, user?.id, isTeacher]);

  const deletableSelectedItems = useMemo(() => {
    return selectedItems.filter((item) => {
      const isAuthor = Boolean(user?.id && item.authorId === user.id);
      return !isTeacher || (isAuthor && (item.status === "DRAFT" || item.status === "ARCHIVED"));
    });
  }, [selectedItems, user?.id, isTeacher]);

  const handleBatchSubmit = async () => {
    for (const item of submittableSelectedItems) {
      await submitMutation.mutateAsync(item.id);
    }
    setSelectedIds(new Set());
  };

  const handleBatchPublish = async () => {
    for (const item of publishableSelectedItems) {
      await publishMutation.mutateAsync(item.id);
    }
    setSelectedIds(new Set());
  };

  const handleBatchActivate = async () => {
    for (const item of activatableSelectedItems) {
      await activateMutation.mutateAsync(item.id);
    }
    setSelectedIds(new Set());
  };

  const handleBatchDelete = () => {
    if (deletableSelectedItems.length === 0) return;
    setDeleteTarget({
      type: "batch",
      count: deletableSelectedItems.length,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "single" && deleteTarget.id) {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } else if (deleteTarget.type === "batch") {
      for (const item of deletableSelectedItems) {
        await deleteMutation.mutateAsync(item.id);
      }
      setSelectedIds(new Set());
    }
    setDeleteTarget(null);
  };

  const filterGroups: readonly FilterGroup[] = useMemo(() => {
    const list: FilterGroup[] = [];

    if (academicYears.length > 0) {
      list.push({
        id: "academicYear",
        label: "Academic Year",
        options: [
          { label: "All", value: "ALL" },
          ...academicYears.map((y) => ({
            label: y.name.replace(/Academic Year/i, "").trim() || y.name,
            value: y.id,
          })),
        ],
        selectedValue: selectedAcademicYearId,
        onSelect: (val) => {
          setSelectedAcademicYearId(val);
          setFilters((prev) => ({
            ...prev,
            academicYearId: val === "ALL" ? undefined : val,
            page: 1,
          }));
        },
        icon: Calendar,
      });
    }

    list.push({
      id: "type",
      label: "Type",
      options: TYPE_FILTER_OPTIONS,
      selectedValue: filters.type || "ALL",
      onSelect: handleTypeSelect,
      icon: BookOpen,
    });

    list.push({
      id: "status",
      label: "Status",
      options: STATUS_FILTER_OPTIONS,
      selectedValue: filters.status || "ALL",
      onSelect: handleStatusSelect,
      icon: ShieldCheck,
    });

    return list;
  }, [academicYears, selectedAcademicYearId, filters.type, filters.status]);

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
            {filteredByGradeItems.length === 1 ? "material" : "materials"}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-none border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search materials..."
          filters={filterGroups}
          actionButton={
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAiDraftModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-none text-xs font-semibold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer shadow-2xs shrink-0"
                title="Draft Curriculum Content with AI"
              >
                <Sparkles size={14} />
                <span>Draft with AI</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                <Plus size={14} />
                <span>New Material</span>
              </button>
            </div>
          }
        />
      </div>

      <ContentGradeTabs
        grades={gradeTabs}
        selectedGradeId={selectedGradeId}
        onSelectGrade={handleSelectGradeTab}
        totalCount={items.length}
      />

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
            {submittableSelectedItems.length > 0 && (
              <button
                type="button"
                onClick={handleBatchSubmit}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Send size={11} className="text-muted-foreground" />
                <span>Submit ({submittableSelectedItems.length})</span>
              </button>
            )}
            {publishableSelectedItems.length > 0 && (
              <button
                type="button"
                onClick={handleBatchPublish}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Check size={11} className="text-muted-foreground" />
                <span>Publish ({publishableSelectedItems.length})</span>
              </button>
            )}
            {activatableSelectedItems.length > 0 && (
              <button
                type="button"
                onClick={handleBatchActivate}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <RotateCcw size={11} className="text-muted-foreground" />
                <span>Activate ({activatableSelectedItems.length})</span>
              </button>
            )}
            {deletableSelectedItems.length > 0 && (
              <button
                type="button"
                onClick={handleBatchDelete}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors cursor-pointer"
              >
                <Trash2 size={11} />
                <span>Delete ({deletableSelectedItems.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading && !data ? (
        <div className="py-20 flex items-center justify-center bg-card rounded-none border border-border">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <ErrorAlert
            message={getErrorMessage(error, "Failed to load learning materials.")}
          />
        </div>
      ) : subjectGroups.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <Folder size={20} />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            No Materials Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            {activeGrade
              ? `No subjects or materials found for Grade ${activeGrade.level}.`
              : "No learning materials match the selected filters."}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus size={13} />
            <span>New Material</span>
          </button>
        </div>
      ) : (
        <SearchQueryProvider query={search}>
          <div className="space-y-3">
            {subjectGroups.map((subject) => (
              <ContentSubjectAccordion
                key={subject.id}
                subject={subject}
                isOpen={openSubjectIds.has(subject.id)}
                onToggle={() => handleToggleSubject(subject.id)}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onViewDetail={(item) => setDetailItem(item)}
                onEdit={handleOpenEdit}
                onOpenUpload={(item) => setUploadTargetItem(item)}
                onSaveNewVersion={handleOpenNewVersion}
                onSubmitForReview={(item) => submitMutation.mutate(item.id)}
                onApprove={(item) => approveMutation.mutate(item.id)}
                onPublish={(item) => publishMutation.mutate(item.id)}
                onArchive={(item) => archiveMutation.mutate(item.id)}
                onActivate={(item) => activateMutation.mutate(item.id)}
                onDelete={handleDelete}
                onAddMaterial={handleOpenAddForSubject}
              />
            ))}
          </div>
        </SearchQueryProvider>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="bg-card rounded-2xl border border-border p-3 sm:px-4 flex items-center justify-between text-xs text-muted-foreground shadow-xs">
          <span>
            Page <strong className="text-foreground">{pagination.page}</strong>{" "}
            of{" "}
            <strong className="text-foreground">
              {pagination.totalPages}
            </strong>{" "}
            ({pagination.total} total)
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
        allowedSubjectIds={isTeacher ? allowedSubjectIds : undefined}
        allowedGradeIds={isTeacher ? allowedGradeIds : undefined}
      />

      <ContentDetailModal
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        item={detailItem}
        onOpenNewVersionModal={(item: LearningContentDetailItem) => {
          setDetailItem(null);
          handleOpenNewVersion(item);
        }}
      />

      <ContentVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => {
          setIsVersionModalOpen(false);
          setVersionTargetItem(null);
        }}
        item={versionTargetItem}
      />

      <ContentUploadModal
        isOpen={Boolean(uploadTargetItem)}
        onClose={() => setUploadTargetItem(null)}
        item={uploadTargetItem}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === "batch"
            ? "Delete Selected Materials"
            : "Delete Material"
        }
        description={
          deleteTarget?.type === "batch"
            ? `Are you sure you want to delete ${deleteTarget.count} selected materials? All associated files in cloud storage will be permanently removed.`
            : "Are you sure you want to delete this learning material? All associated files in cloud storage will be permanently removed."
        }
        itemName={deleteTarget?.title}
        isPending={deleteMutation.isPending}
      />

      {isAiDraftModalOpen && subjects.length > 0 && (
        <AiGenerateContentModal
          isOpen={isAiDraftModalOpen}
          onClose={() => setIsAiDraftModalOpen(false)}
          subjectId={subjects[0].id}
          gradeId={selectedGradeId !== "ALL" ? selectedGradeId : undefined}
          topicId={
            items.find((m) => m.primaryTopic?.topicId)?.primaryTopic?.topicId ||
            items[0]?.primaryTopic?.topicId ||
            undefined
          }
          topicTitle={
            items.find((m) => m.primaryTopic?.topicTitle)?.primaryTopic?.topicTitle ||
            subjects[0].name ||
            "Curriculum Material"
          }
          onGenerated={() => refetch()}
        />
      )}
    </div>
  );
}
