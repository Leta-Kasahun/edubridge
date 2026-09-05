"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Layers,
  Send,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Globe,
  Archive,
} from "lucide-react";
import { useMyTeacherAssignments } from "@/features/academic/assignments/teacher";
import {
  useContentList,
  useSubmitContent,
  usePublishContent,
  useArchiveContent,
  useDeleteContent,
} from "@/features/learning-content/hooks/useLearningContent";
import {
  ContentStatus,
  LearningContentListItem,
} from "@/features/learning-content/types/content.types";
import { ContentFormModal } from "@/features/learning-content/components/content/ContentFormModal";
import { ContentDetailModal } from "@/features/learning-content/components/content/ContentDetailModal";
import { ContentTable } from "@/features/learning-content/components/content/ContentTable";
import {
  CurriculumSelector,
  CurriculumSelectionValue,
} from "@/features/curriculum/components/CurriculumSelector";
import { DashboardMetricCard } from "../../DashboardMetricCard";
import {
  SelectDropdown,
  SelectDropdownOption,
  LoadingSpinner,
} from "@/shared/components";

type LifecycleFilter =
  | "ALL"
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

export function TeacherMaterialsTab() {
  const {
    assignedSubjects,
    assignedGrades,
    assignedSections,
    allowedSubjectIds,
    allowedGradeIds,
    isLoading: isAssignmentsLoading,
  } = useMyTeacherAssignments();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<LifecycleFilter>("ALL");
  const [showCurriculumBrowser, setShowCurriculumBrowser] = useState(false);
  const [curriculumValue, setCurriculumValue] = useState<CurriculumSelectionValue>({});

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<LearningContentListItem | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<LearningContentListItem | null>(null);

  const queryFilters = useMemo(() => {
    return {
      subjectId: selectedSubjectId || undefined,
      gradeId: selectedGradeId || undefined,
      status: statusFilter === "ALL" ? undefined : (statusFilter as ContentStatus),
      limit: 100,
    };
  }, [selectedSubjectId, selectedGradeId, statusFilter]);

  const {
    data: contentResponse,
    isLoading: isContentLoading,
    refetch: refetchContent,
  } = useContentList(queryFilters);

  const submitMutation = useSubmitContent();
  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();
  const deleteMutation = useDeleteContent();

  const allMaterials = contentResponse?.items ?? [];

  const subjectOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const defaultOption: SelectDropdownOption = { value: "", label: "All Assigned Subjects" };
    const mapped = assignedSubjects.map((s) => ({
      value: s.id,
      label: s.code ? `${s.name} (${s.code})` : s.name,
    }));
    return [defaultOption, ...mapped];
  }, [assignedSubjects]);

  const gradeOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const defaultOption: SelectDropdownOption = { value: "", label: "All Assigned Grades" };
    const mapped = assignedGrades.map((g) => ({
      value: g.id,
      label: `Grade ${g.level}`,
    }));
    return [defaultOption, ...mapped];
  }, [assignedGrades]);

  const draftCount = useMemo(
    () => allMaterials.filter((item) => item.status === "DRAFT").length,
    [allMaterials]
  );

  const pendingReviewCount = useMemo(
    () => allMaterials.filter((item) => item.status === "PENDING_REVIEW").length,
    [allMaterials]
  );

  const publishedCount = useMemo(
    () => allMaterials.filter((item) => item.status === "PUBLISHED").length,
    [allMaterials]
  );

  const archivedCount = useMemo(
    () => allMaterials.filter((item) => item.status === "ARCHIVED").length,
    [allMaterials]
  );

  const handleOpenCreateModal = () => {
    setItemToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: LearningContentListItem) => {
    setItemToEdit(item);
    setIsFormModalOpen(true);
  };

  const handleSubmitForReview = async (item: LearningContentListItem) => {
    await submitMutation.mutateAsync(item.id);
    refetchContent();
  };

  const handlePublish = async (item: LearningContentListItem) => {
    await publishMutation.mutateAsync(item.id);
    refetchContent();
  };

  const handleArchive = async (item: LearningContentListItem) => {
    if (window.confirm(`Archive "${item.title}"? Students will no longer see this resource.`)) {
      await archiveMutation.mutateAsync(item.id);
      refetchContent();
    }
  };

  const handleDelete = async (item: LearningContentListItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      await deleteMutation.mutateAsync(item.id);
      refetchContent();
    }
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setItemToEdit(null);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Assigned Courses"
          value={assignedSubjects.length}
          detail={`${assignedGrades.length} grades · ${assignedSections.length} sections`}
          isLoading={isAssignmentsLoading}
        />
        <DashboardMetricCard
          title="My Drafts"
          value={draftCount}
          detail="In-progress materials"
          isLoading={isContentLoading}
        />
        <DashboardMetricCard
          title="Submitted for Review"
          value={pendingReviewCount}
          detail="Under admin review"
          isLoading={isContentLoading}
        />
        <DashboardMetricCard
          title="Published Materials"
          value={publishedCount}
          detail="Live to enrolled students"
          isLoading={isContentLoading}
        />
      </div>

      <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Teaching Materials
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Author, manage, directly publish, and organize resources for your courses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCurriculumBrowser(!showCurriculumBrowser)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
            >
              <Layers size={13} className="text-primary" />
              <span>Curriculum</span>
              {showCurriculumBrowser ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Author Material</span>
            </button>
          </div>
        </div>

        {showCurriculumBrowser && (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Sparkles size={14} className="text-primary" />
                <span>Browse Curriculum for Assigned Courses</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Curriculum Version → Grade → Subject → Unit → Topic → Objectives
              </span>
            </div>

            <CurriculumSelector
              value={curriculumValue}
              onChange={setCurriculumValue}
              minLevel="OBJECTIVE"
              multiObjective={true}
              allowedSubjectIds={allowedSubjectIds}
              allowedGradeIds={allowedGradeIds}
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              All Items ({allMaterials.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("DRAFT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === "DRAFT"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Drafts ({draftCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PUBLISHED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === "PUBLISHED"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING_REVIEW")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === "PENDING_REVIEW"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              In Review ({pendingReviewCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === "APPROVED"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Approved
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ARCHIVED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === "ARCHIVED"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Archived ({archivedCount})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="w-full sm:w-44">
              <SelectDropdown
                options={subjectOptions}
                value={selectedSubjectId}
                onChange={setSelectedSubjectId}
                placeholder="Filter by Subject"
              />
            </div>
            <div className="w-full sm:w-36">
              <SelectDropdown
                options={gradeOptions}
                value={selectedGradeId}
                onChange={setSelectedGradeId}
                placeholder="Filter by Grade"
              />
            </div>
          </div>
        </div>

        {isContentLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="md" />
            <p className="text-xs text-muted-foreground mt-2">Loading learning materials...</p>
          </div>
        ) : allMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border bg-muted/10">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2.5">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No Materials Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {statusFilter !== "ALL"
                ? `You have no learning materials in status "${statusFilter}".`
                : "You have not authored any learning materials for the selected subject and grade yet."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 mt-3.5 h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Author New Material</span>
            </button>
          </div>
        ) : (
          <ContentTable
            items={allMaterials}
            onViewDetail={(item) => setSelectedDetailItem(item)}
            onEdit={handleEdit}
            onSaveNewVersion={() => {}}
            onSubmitForReview={handleSubmitForReview}
            onPublish={handlePublish}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onOpenAddModal={handleOpenCreateModal}
          />
        )}
      </div>

      <ContentFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        itemToEdit={itemToEdit}
        allowedSubjectIds={allowedSubjectIds}
        allowedGradeIds={allowedGradeIds}
        onContentCreated={refetchContent}
      />

      <ContentDetailModal
        contentId={selectedDetailItem?.id ?? null}
        isOpen={Boolean(selectedDetailItem)}
        onClose={() => setSelectedDetailItem(null)}
      />
    </div>
  );
}
