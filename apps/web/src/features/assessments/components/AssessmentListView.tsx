"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, BookOpen, Play } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { TableSkeleton } from "@/shared/components";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { SearchQueryProvider } from "@/shared/components/SearchHighlight";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useAssignAssessment,
  usePublishAssessment,
  useArchiveAssessment,
  useUnarchiveAssessment,
} from "../hooks/useAssessments";
import {
  AssessmentItem,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
} from "../types/assessment.types";
import { AssessmentGradeTabs } from "./AssessmentGradeTabs";
import {
  AssessmentSubjectAccordion,
  AssessmentSubjectGroup,
} from "./AssessmentSubjectAccordion";
import { AssessmentRowActions } from "./AssessmentRowActions";
import { AssessmentFormModal } from "./AssessmentFormModal";
import { AssessmentAssignModal } from "./AssessmentAssignModal";
import { useGrades, useSubjects, useSections, useAcademicYears } from "@/features/academic";
import { useAuthStore } from "@/stores/auth.store";
import {
  ASSESSMENT_TYPES,
  ASSESSMENT_STATUSES,
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_STATUS_LABELS,
  AssessmentType,
  AssessmentStatus,
} from "@/shared/constants/assessment.constants";

export function AssessmentListView() {
  const user = useAuthStore((s) => s.user);
  const isStudent = Boolean(
    user?.roles?.includes("STUDENT") &&
      !user?.roles?.includes("TEACHER") &&
      !user?.roles?.includes("SCHOOL_ADMIN")
  );

  const [search, setSearch] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [openSubjectIds, setOpenSubjectIds] = useState<Set<string>>(new Set());

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<AssessmentItem | null>(null);

  const [assigningAssessment, setAssigningAssessment] = useState<AssessmentItem | null>(null);
  const [deletingAssessment, setDeletingAssessment] = useState<AssessmentItem | null>(null);

  const { data: academicYearsData } = useAcademicYears();
  const academicYears = academicYearsData?.data || [];

  const { data: gradesData } = useGrades();
  const grades = gradesData || [];

  const { data: subjectsData } = useSubjects();
  const subjects = subjectsData || [];

  const { data: sectionsData } = useSections();
  const sections = sectionsData || [];

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: assessmentsData,
    isLoading,
    error,
  } = useAssessments({
    search: debouncedSearch || undefined,
    academicYearId: selectedAcademicYearId || undefined,
    type: selectedType ? (selectedType as AssessmentType) : undefined,
    status: selectedStatus ? (selectedStatus as AssessmentStatus) : undefined,
  });

  const assessments = assessmentsData?.items || [];

  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();
  const assignMutation = useAssignAssessment();
  const publishMutation = usePublishAssessment();
  const archiveMutation = useArchiveAssessment();
  const unarchiveMutation = useUnarchiveAssessment();

  const subjectGroups = useMemo<AssessmentSubjectGroup[]>(() => {
    let filtered = selectedGradeId
      ? assessments.filter(
          (a) =>
            a.gradeId === selectedGradeId ||
            a.grade?.id === selectedGradeId ||
            a.assignments?.some((as) => as.section?.grade?.id === selectedGradeId)
        )
      : assessments;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.subject?.name && a.subject.name.toLowerCase().includes(q)) ||
          (a.examContext?.name && a.examContext.name.toLowerCase().includes(q))
      );
    }

    const map = new Map<string, AssessmentItem[]>();

    for (const assessment of filtered) {
      const subjectId =
        assessment.subjectId ||
        assessment.subject?.id ||
        assessment.examContext?.id ||
        "general";
      const list = map.get(subjectId) || [];
      list.push(assessment);
      map.set(subjectId, list);
    }

    const groups: AssessmentSubjectGroup[] = [];

    for (const subj of subjects) {
      const matched = filtered.filter(
        (a) =>
          a.subjectId === subj.id ||
          a.subject?.id === subj.id ||
          (a.subject?.name && a.subject.name.toLowerCase() === subj.name.toLowerCase()) ||
          a.examContext?.id === subj.id
      );
      if (matched.length > 0) {
        groups.push({
          id: subj.id,
          name: subj.name,
          code: subj.code,
          assessments: matched,
        });
      }
    }

    const unassigned = filtered.filter(
      (a) => !groups.some((g) => g.assessments.some((item) => item.id === a.id))
    );

    if (unassigned.length > 0) {
      groups.push({
        id: "general-assessments",
        name: "General & Comprehensive Assessments",
        code: "GEN",
        assessments: unassigned,
      });
    }

    return groups;
  }, [assessments, subjects, selectedGradeId, search]);

  const toggleSubject = (id: string) => {
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

  const handleCreateOrUpdate = async (
    payload: CreateAssessmentPayload | UpdateAssessmentPayload
  ) => {
    if (editingAssessment) {
      await updateMutation.mutateAsync({
        id: editingAssessment.id,
        payload: payload as UpdateAssessmentPayload,
      });
    } else {
      await createMutation.mutateAsync(payload as CreateAssessmentPayload);
    }
    setIsFormModalOpen(false);
    setEditingAssessment(null);
  };

  const handleAssign = async (payload: { sectionIds: string[]; dueAt?: string | null }) => {
    if (!assigningAssessment) return;
    await assignMutation.mutateAsync({
      id: assigningAssessment.id,
      payload,
    });
    setAssigningAssessment(null);
  };

  const handlePublish = async (assessment: AssessmentItem) => {
    await publishMutation.mutateAsync(assessment.id);
  };

  const handleUnarchive = async (assessment: AssessmentItem) => {
    await unarchiveMutation.mutateAsync(assessment.id);
  };

  const handleArchiveConfirm = async () => {
    if (!deletingAssessment) return;
    await archiveMutation.mutateAsync(deletingAssessment.id);
    setDeletingAssessment(null);
  };

  const filterGroups: FilterGroup[] = [
    ...(academicYears.length > 0
      ? [
          {
            id: "academicYear",
            label: "Academic Year",
            selectedValue: selectedAcademicYearId || "ALL",
            onSelect: (val: string) => setSelectedAcademicYearId(val === "ALL" ? "" : val),
            options: [
              { label: "All", value: "ALL" },
              ...academicYears.map((ay) => ({
                label: ay.name || ay.code,
                value: ay.id,
              })),
            ],
          },
        ]
      : []),
    {
      id: "type",
      label: "Type",
      selectedValue: selectedType || "ALL",
      onSelect: (val: string) => setSelectedType(val === "ALL" ? "" : val),
      options: ASSESSMENT_TYPES.map((t: AssessmentType) => ({
        label: ASSESSMENT_TYPE_LABELS[t],
        value: t,
      })),
    },
    ...(!isStudent
      ? [
          {
            id: "status",
            label: "Status",
            selectedValue: selectedStatus || "ALL",
            onSelect: (val: string) => setSelectedStatus(val === "ALL" ? "" : val),
            options: ASSESSMENT_STATUSES.map((s: AssessmentStatus) => ({
              label: ASSESSMENT_STATUS_LABELS[s],
              value: s,
            })),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-none border border-border p-3.5 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search assessments by title or topic..."
          filters={filterGroups}
          actionButton={
            !isStudent ? (
              <button
                type="button"
                onClick={() => {
                  setEditingAssessment(null);
                  setIsFormModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                <Plus size={14} />
                <span>Create Assessment</span>
              </button>
            ) : undefined
          }
        />
      </div>

      <AssessmentGradeTabs
        grades={grades}
        selectedGradeId={selectedGradeId}
        onSelectGrade={setSelectedGradeId}
        assessments={assessments}
      />

      {isLoading && !assessmentsData ? (
        <TableSkeleton rows={6} columns={5} hasToolbar={false} />
      ) : error ? (
        <ErrorAlert message="Failed to load assessments. Please try again." />
      ) : subjectGroups.length === 0 ? (
        <div className="bg-card rounded-none border border-border p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-none bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <BookOpen size={24} />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Assessments Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isStudent
              ? "You do not have any assessments assigned at this time."
              : "Get started by creating your first assessment and attaching questions from your question bank."}
          </p>
          {!isStudent && (
            <button
              type="button"
              onClick={() => {
                setEditingAssessment(null);
                setIsFormModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              Create First Assessment
            </button>
          )}
        </div>
      ) : (
        <SearchQueryProvider query={search}>
          <div className="space-y-4">
            {subjectGroups.map((group) => {
              const isOpen = openSubjectIds.has(group.id);
              return (
                <AssessmentSubjectAccordion
                  key={group.id}
                  group={group}
                  isOpen={isOpen}
                  onToggle={() => toggleSubject(group.id)}
                  renderActions={(assessment) =>
                    isStudent ? (
                      <Link
                        href={ROUTES.ASSESSMENTS.ATTEMPT(assessment.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                      >
                        <Play size={13} className="fill-current" />
                        <span>Start Assessment</span>
                      </Link>
                    ) : (
                      <AssessmentRowActions
                        assessment={assessment}
                        onAssign={(a) => setAssigningAssessment(a)}
                        onPublish={(a) => handlePublish(a)}
                        onUnarchive={(a) => handleUnarchive(a)}
                        onEdit={(a) => {
                          setEditingAssessment(a);
                          setIsFormModalOpen(true);
                        }}
                        onDelete={(a) => setDeletingAssessment(a)}
                      />
                    )
                  }
                />
              );
            })}
          </div>
        </SearchQueryProvider>
      )}

      {isFormModalOpen && (
        <AssessmentFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingAssessment(null);
          }}
          onSubmit={handleCreateOrUpdate}
          initialData={editingAssessment}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {assigningAssessment && (
        <AssessmentAssignModal
          isOpen={Boolean(assigningAssessment)}
          onClose={() => setAssigningAssessment(null)}
          onSubmit={handleAssign}
          assessment={assigningAssessment}
          sections={sections}
          isLoading={assignMutation.isPending}
        />
      )}

      {deletingAssessment && (
        <ConfirmDeleteModal
          isOpen={Boolean(deletingAssessment)}
          onClose={() => setDeletingAssessment(null)}
          onConfirm={handleArchiveConfirm}
          title="Archive Assessment"
          description={`Are you sure you want to archive "${deletingAssessment.title}"? Students will no longer be able to start new attempts.`}
          isPending={archiveMutation.isPending}
        />
      )}
    </div>
  );
}
