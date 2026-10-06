"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  useAssessment,
  useSetAssessmentQuestions,
  ASSESSMENT_QUERY_KEYS,
} from "../hooks/useAssessments";
import { useQueryClient } from "@tanstack/react-query";
import { questionBankService } from "@/features/question-bank/services/question-bank.service";
import { QuestionListItem } from "@/features/question-bank/types/question-bank.types";
import { QuestionPreviewModal } from "@/features/question-bank/components/questions/QuestionPreviewModal";
import { QuestionFormModal } from "@/features/question-bank/components/questions/QuestionFormModal";
import {
  AssessmentDetailHeader,
  AssessmentQuestionsTab,
  AssessmentBankSelectorWorkspace,
} from "./detail";
import { useQuestionBanks } from "@/features/question-bank/hooks/useQuestionBanks";

interface AssessmentDetailViewProps {
  readonly id: string;
}

export function AssessmentDetailView({ id }: AssessmentDetailViewProps) {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "bank" ? "bank-selector" : "questions";
  const [viewMode, setViewMode] = useState<"questions" | "bank-selector">(initialMode);

  // Dialog / Modal state
  const [isAuthoringQuestion, setIsAuthoringQuestion] = useState(false);
  const [previewingQuestion, setPreviewingQuestion] = useState<QuestionListItem | null>(null);

  // Queries
  const { data: assessment, isLoading, error } = useAssessment(id);
  const { data: questionBanksData } = useQuestionBanks();
  const questionBanks = questionBanksData?.items || [];

  // Mutations
  const setQuestionsMutation = useSetAssessmentQuestions();
  const queryClient = useQueryClient();

  const handleResolveReportInPreview = async (
    questionId: string,
    reportId: string,
    resolutionNote?: string
  ) => {
    await questionBankService.resolveQuestionReport(questionId, reportId, resolutionNote);
    queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.detail(id) });
  };

  const questionsList = useMemo(() => {
    return [...(assessment?.questions || [])].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
  }, [assessment?.questions]);

  const totalPoints = useMemo(() => {
    return questionsList.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
  }, [questionsList]);

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="space-y-4">
        <Link
          href={ROUTES.ASSESSMENTS.BASE}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Assessments</span>
        </Link>
        <ErrorAlert
          title="Assessment Not Found"
          message="We could not retrieve the details for this assessment."
        />
      </div>
    );
  }

  const handleMoveQuestion = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questionsList.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...questionsList];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const payload = reordered.map((q, idx) => ({
      questionVersionId: q.questionVersionId,
      orderIndex: idx + 1,
      points: Number(q.points) || 1,
    }));

    await setQuestionsMutation.mutateAsync({
      id: assessment.id,
      questions: payload,
    });
  };

  const handleUpdateQuestionPoints = async (questionVersionId: string, newPoints: number) => {
    const payload = questionsList.map((q) => ({
      questionVersionId: q.questionVersionId,
      orderIndex: q.orderIndex,
      points: q.questionVersionId === questionVersionId ? Math.max(0.5, newPoints) : Number(q.points) || 1,
    }));

    await setQuestionsMutation.mutateAsync({
      id: assessment.id,
      questions: payload,
    });
  };

  const handleRemoveQuestion = async (questionVersionId: string) => {
    const payload = questionsList
      .filter((q) => q.questionVersionId !== questionVersionId)
      .map((q, idx) => ({
        questionVersionId: q.questionVersionId,
        orderIndex: idx + 1,
        points: Number(q.points) || 1,
      }));

    await setQuestionsMutation.mutateAsync({
      id: assessment.id,
      questions: payload,
    });
  };

  const handleBulkRemoveQuestions = async (questionVersionIds: string[]) => {
    const removeSet = new Set(questionVersionIds);
    const payload = questionsList
      .filter((q) => !removeSet.has(q.questionVersionId))
      .map((q, idx) => ({
        questionVersionId: q.questionVersionId,
        orderIndex: idx + 1,
        points: Number(q.points) || 1,
      }));

    await setQuestionsMutation.mutateAsync({
      id: assessment.id,
      questions: payload,
    });
  };

  const handleSaveBankQuestions = async (
    questions: Array<{ questionVersionId: string; orderIndex: number; points: number }>
  ) => {
    await setQuestionsMutation.mutateAsync({
      id: assessment.id,
      questions,
    });
    setViewMode("questions");
  };

  if (viewMode === "bank-selector") {
    return (
      <AssessmentBankSelectorWorkspace
        assessment={assessment}
        questionBanks={questionBanks}
        onCancel={() => setViewMode("questions")}
        onSave={handleSaveBankQuestions}
        isSaving={setQuestionsMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      {/* Enterprise Single-Row Header */}
      <AssessmentDetailHeader
        assessment={assessment}
        questionCount={questionsList.length}
        totalPoints={totalPoints}
        onOpenSelector={() => setViewMode("bank-selector")}
        onOpenAuthor={() => setIsAuthoringQuestion(true)}
        hasBankAvailable={Boolean(questionBanks[0]?.id)}
      />

      {/* Questions Workspace with TableToolbar and Filtering */}
      <AssessmentQuestionsTab
        questions={questionsList}
        onOpenSelector={() => setViewMode("bank-selector")}
        onOpenAuthor={() => setIsAuthoringQuestion(true)}
        onMoveQuestion={handleMoveQuestion}
        onUpdatePoints={handleUpdateQuestionPoints}
        onRemoveQuestion={handleRemoveQuestion}
        onBulkRemoveQuestions={handleBulkRemoveQuestions}
        onPreviewQuestion={setPreviewingQuestion}
        hasBankAvailable={Boolean(questionBanks[0]?.id)}
        isBusy={setQuestionsMutation.isPending}
      />

      {previewingQuestion && (
        <QuestionPreviewModal
          isOpen={Boolean(previewingQuestion)}
          onClose={() => setPreviewingQuestion(null)}
          question={previewingQuestion}
          onResolveReport={handleResolveReportInPreview}
        />
      )}

      {isAuthoringQuestion && questionBanks[0]?.id && (
        <QuestionFormModal
          isOpen={isAuthoringQuestion}
          onClose={() => setIsAuthoringQuestion(false)}
          bankId={questionBanks[0].id}
        />
      )}
    </div>
  );
}

