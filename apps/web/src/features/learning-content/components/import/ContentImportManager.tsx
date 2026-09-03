"use client";

import { useState, useEffect } from "react";
import { Layers } from "lucide-react";
import {
  useCurricula,
  useCurriculumDetails,
} from "@/features/curriculum/curricula/hooks/useCurricula";
import {
  usePreviewContentImport,
  useCommitContentImport,
} from "../../hooks/useContentImport";
import { ContentImportUpload } from "./ContentImportUpload";
import { ContentImportPreviewTable } from "./ContentImportPreviewTable";
import { ContentImportResultCard } from "./ContentImportResultCard";
import {
  ImportStep,
  ContentImportPreview,
  ContentImportCommitResult,
} from "../../types/import.types";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

export function ContentImportManager() {
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [step, setStep] = useState<ImportStep>("UPLOAD");
  const [previewData, setPreviewData] = useState<ContentImportPreview | null>(
    null
  );
  const [commitResult, setCommitResult] =
    useState<ContentImportCommitResult | null>(null);

  const { data: curriculaData } = useCurricula({ limit: 100 });
  const curricula = curriculaData?.data ?? [];

  const { data: curriculumDetail, isLoading: isLoadingDetail } =
    useCurriculumDetails(selectedCurriculumId || null);
  const versions = curriculumDetail?.versions ?? [];

  useEffect(() => {
    if (curricula.length > 0 && !selectedCurriculumId) {
      const first = curricula[0];
      if (first) {
        setSelectedCurriculumId(first.id);
      }
    }
  }, [curricula, selectedCurriculumId]);

  useEffect(() => {
    if (versions.length > 0) {
      const activeOrDraft =
        versions.find((v) => v.status === "ACTIVE") ||
        versions.find((v) => v.status === "DRAFT") ||
        versions[0];
      if (
        activeOrDraft &&
        (!selectedVersionId ||
          !versions.some((v) => v.id === selectedVersionId))
      ) {
        setSelectedVersionId(activeOrDraft.id);
      }
    } else {
      setSelectedVersionId("");
    }
  }, [versions, selectedVersionId]);

  const previewMutation = usePreviewContentImport();
  const commitMutation = useCommitContentImport();

  const handleGeneratePreview = async (csvContent: string) => {
    try {
      const result = await previewMutation.mutateAsync({
        csvContent,
        curriculumVersionId: selectedVersionId || undefined,
      });
      setPreviewData(result);
      setStep("PREVIEW");
    } catch {
    }
  };

  const handleCommit = async () => {
    if (!previewData) return;

    try {
      const result = await commitMutation.mutateAsync({
        rows: previewData.rows,
        curriculumVersionId: selectedVersionId || undefined,
      });
      setCommitResult(result);
      setStep("RESULT");
    } catch {
    }
  };

  const handleReset = () => {
    setStep("UPLOAD");
    setPreviewData(null);
    setCommitResult(null);
  };

  const curriculumOptions: SelectDropdownOption[] = curricula.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const versionOptions: SelectDropdownOption[] = versions.map((v) => ({
    value: v.id,
    label: `${v.name} (${v.code})`,
  }));

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-12">
      {step !== "RESULT" && (
        <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <h2 className="text-base font-bold text-foreground">
              Target Curriculum Scope
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
            <SelectDropdown
              label="Curriculum"
              value={selectedCurriculumId}
              onChange={(val) => {
                setSelectedCurriculumId(val);
                setSelectedVersionId("");
              }}
              options={curriculumOptions}
              placeholder="Select curriculum..."
              disabled={step !== "UPLOAD"}
            />
            <SelectDropdown
              label="Version (Optional)"
              value={selectedVersionId}
              onChange={(val) => setSelectedVersionId(val)}
              options={versionOptions}
              placeholder={
                versions.length === 0
                  ? "All versions"
                  : "Select version scope..."
              }
              disabled={step !== "UPLOAD" || versions.length === 0 || isLoadingDetail}
            />
          </div>
        </div>
      )}

      {step === "UPLOAD" && (
        <ContentImportUpload
          isPending={previewMutation.isPending}
          onGeneratePreview={handleGeneratePreview}
          error={
            previewMutation.error
              ? getErrorMessage(
                  previewMutation.error,
                  "Failed to validate import file."
                )
              : null
          }
        />
      )}

      {step === "PREVIEW" && previewData && (
        <ContentImportPreviewTable
          previewData={previewData}
          isCommitting={commitMutation.isPending}
          onCommit={handleCommit}
          onBack={() => setStep("UPLOAD")}
          commitError={
            commitMutation.error
              ? getErrorMessage(
                  commitMutation.error,
                  "Failed to commit import."
                )
              : null
          }
        />
      )}

      {step === "RESULT" && commitResult && (
        <ContentImportResultCard result={commitResult} onReset={handleReset} />
      )}
    </div>
  );
}
