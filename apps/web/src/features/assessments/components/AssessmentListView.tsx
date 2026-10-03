"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, BookOpen, Play } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { ConfirmDeleteModal } from "@/features/curriculum/structure/components/ConfirmDeleteModal";
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useSetAssessmentQuestions,
  useAssignAssessment,
  usePublishAssessment,
  useArchiveAssessment,
} from "../hooks/useAssessments";
import { useAssessmentAttempts, useManualGradeAttempt } from "../hooks/useAssessmentAttempt";
import {
  AssessmentItem,
  AssessmentAttemptResult,
  ManualGradeAttemptPayload,
} from "../types/assessment.types";
import { AssessmentGradeTabs } from "./AssessmentGradeTabs";
import {
  AssessmentSubjectAccordion,
  AssessmentSubjectGroup,
} from "./AssessmentSubjectAccordion";
import { AssessmentRowActions } from "./AssessmentRowActions";
import { AssessmentFormModal } from "./AssessmentFormModal";
import { AssessmentAssignModal } from "./AssessmentAssignModal";
import { AssessmentQuestionSelectorModal } from "./AssessmentQuestionSelectorModal";
import { AssessmentResultsView } from "./AssessmentResultsView";
import { AssessmentManualGradeModal } from "./AssessmentManualGradeModal";
import { useGrades, useSubjects, useSections, useAcademicYears } from "@/features/academic";
import { useQuestionBanks } from "@/features/question-bank/hooks/useQuestionBanks";
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
  const [selectingQuestionsFor, setSelectingQuestionsFor] = useState<AssessmentItem | null>(null);

  const [viewingResultsFor, setViewingResultsFor] = useState<AssessmentItem | null>(null);
  const [manualGradingAttempt, setManualGradingAttempt] = useState<AssessmentAttemptResult | null>(null);

  const [deletingAssessment, setDeletingAssessment] = useState<AssessmentItem | null>(null);

  const { data: academicYearsData } = useAcademicYears();
  const academicYears = academicYearsData?.data || [];

  const { data: gradesData } = useGrades();
  const grades = gradesData || [];

  const { data: subjectsData } = useSubjects();
  const subjects = subjectsData || [];

  const { data: sectionsData } = useSections();
  const sections = sectionsData || [];

  const { data: questionBanksData } = useQuestionBanks();
  const questionBanks = questionBanksData?.items || [];

  const {
    data: assessmentsData,
    isLoading,
    error,
  } = useAssessments({
    search: search || undefined,
    academicYearId: selectedAcademicYearId || undefined,
    type: selectedType ? (selectedType as AssessmentType) : undefined,
    status: selectedStatus ? (selectedStatus as AssessmentStatus) : undefined,
  });

  const assessments = assessmentsData?.items || [];

  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();
  const setQuestionsMutation = useSetAssessmentQuestions();
  const assignMutation = useAssignAssessment();
  const publishMutation = usePublishAssessment();
  const archiveMutation = useArchiveAssessment();
  const manualGradeMutation = useManualGradeAttempt();

  const { data: attemptsData } = useAssessmentAttempts(
    viewingResultsFor?.id || "",
    {}
  );
  const currentAttempts = attemptsData?.items || [];

  const subjectGroups = useMemo<AssessmentSubjectGroup[]>(() => {
    const map = new Map<string, AssessmentItem[]>();

    for (const assessment of assessments) {
      const subjectId = assessment.examContext?.id || "general";
      const list = map.get(subjectId) || [];
      list.push(assessment);
      map.set(subjectId, list);
    }

    const groups: AssessmentSubjectGroup[] = [];

    for (const subj of subjects) {
      const matched = assessments.filter(
        (a) => a.examContext?.id === subj.id || a.title.toLowerCase().includes(subj.name.toLowerCase())
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

    const unassigned = assessments.filter(
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
  }, [assessments, subjects]);

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

  const handleCreateOrUpdate = async (payload: unknown) => {
    if (editingAssessment) {
      await updateMutation.mutateAsync({
        id: editingAssessment.id,
        payload: payload as Parameters<typeof updateMutation.mutateAsync>[0]["payload"],
      });
    } else {
      await createMutation.mutateAsync(
        payload as Parameters<typeof createMutation.mutateAsync>[0]
      );
    }
    setIsFormModalOpen(false);
    setEditingAssessment(null);
  };

  const handleSetQuestions = async (
    questions: Array<{ questionVersionId: string; orderIndex: number; points: number }>
  ) => {
    if (!selectingQuestionsFor) return;
    await setQuestionsMutation.mutateAsync({
      id: selectingQuestionsFor.id,
      questions,
    });
    setSelectingQuestionsFor(null);
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

  const handleArchiveConfirm = async () => {
    if (!deletingAssessment) return;
    await archiveMutation.mutateAsync(deletingAssessment.id);
    setDeletingAssessment(null);
  };

  const handleManualGradeSubmit = async (payload: ManualGradeAttemptPayload) => {
    if (!viewingResultsFor || !manualGradingAttempt) return;
    await manualGradeMutation.mutateAsync({
      assessmentId: viewingResultsFor.id,
      attemptId: manualGradingAttempt.id,
      payload,
    });
    setManualGradingAttempt(null);
  };

  const filterGroups: FilterGroup[] = [
    ...(academicYears.length > 0
      ? [
          {
            id: "academicYear",
            label: "Academic Year",
            selectedValue: selectedAcademicYearId,
            onSelect: (val: string) => setSelectedAcademicYearId(val),
            options: [
              { label: "All", value: "" },
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
      selectedValue: selectedType,
      onSelect: (val: string) => setSelectedType(val),
      options: [
        { label: "All", value: "" },
        ...ASSESSMENT_TYPES.map((t: AssessmentType) => ({
          label: ASSESSMENT_TYPE_LABELS[t],
          value: t,
        })),
      ],
    },
    ...(!isStudent
      ? [
          {
            id: "status",
            label: "Status",
            selectedValue: selectedStatus,
            onSelect: (val: string) => setSelectedStatus(val),
            options: [
              { label: "All", value: "" },
              ...ASSESSMENT_STATUSES.map((s: AssessmentStatus) => ({
                label: ASSESSMENT_STATUS_LABELS[s],
                value: s,
              })),
            ],
          },
        ]
      : []),
  ];

  if (viewingResultsFor) {
    return (
      <>
        <AssessmentResultsView
          assessment={viewingResultsFor}
          attempts={currentAttempts}
          onOpenManualGrade={(attempt) => setManualGradingAttempt(attempt)}
          onBack={() => setViewingResultsFor(null)}
        />

        {manualGradingAttempt && (
          <AssessmentManualGradeModal
            isOpen={Boolean(manualGradingAttempt)}
            onClose={() => setManualGradingAttempt(null)}
            onSubmit={handleManualGradeSubmit}
            assessmentId={viewingResultsFor.id}
            attemptId={manualGradingAttempt.id}
            initialAttempt={manualGradingAttempt}
            isLoading={manualGradeMutation.isPending}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {isStudent ? "My Assessments" : "Assessments"}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isStudent
            ? "View and complete your assigned quizzes, tests, and examinations."
            : "Create, schedule, assign, and grade curriculum assessments."}
        </p>
      </div>

      <AssessmentGradeTabs
        grades={grades}
        selectedGradeId={selectedGradeId}
        onSelectGrade={setSelectedGradeId}
        assessments={assessments}
      />

      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs">
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Plus size={16} />
                Create Assessment
              </button>
            ) : undefined
          }
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorAlert message="Failed to load assessments. Please try again." />
      ) : subjectGroups.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              Create First Assessment
            </button>
          )}
        </div>
      ) : (
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
                      onManageQuestions={(a) => setSelectingQuestionsFor(a)}
                      onAssign={(a) => setAssigningAssessment(a)}
                      onPublish={(a) => handlePublish(a)}
                      onViewResults={(a) => setViewingResultsFor(a)}
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

      {selectingQuestionsFor && (
        <AssessmentQuestionSelectorModal
          isOpen={Boolean(selectingQuestionsFor)}
          onClose={() => setSelectingQuestionsFor(null)}
          onSubmit={handleSetQuestions}
          assessment={selectingQuestionsFor}
          questionBanks={questionBanks}
          isLoading={setQuestionsMutation.isPending}
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
