"use client";

import { useState, useEffect, useMemo } from "react";
import { BookOpen, Layers } from "lucide-react";
import { useCurricula, useCurriculumDetails } from "../../curricula/hooks/useCurricula";
import { usePreviewCurriculumImport, useCommitCurriculumImport } from "../hooks/useCurriculumImport";
import { CurriculumImportUpload } from "./CurriculumImportUpload";
import { CurriculumImportPreviewTable } from "./CurriculumImportPreviewTable";
import { CurriculumImportResultCard } from "./CurriculumImportResultCard";
import {
  ImportStep,
  CurriculumImportPreview,
  CurriculumImportCommitResult,
} from "../types/import.types";
import {
  ErrorAlert,
  LoadingSpinner,
  SelectDropdown,
  SelectDropdownOption,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

export function CurriculumImportManager() {
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [step, setStep] = useState<ImportStep>("UPLOAD");
  const [cachedCsvContent, setCachedCsvContent] = useState<string>("");
  const [previewData, setPreviewData] = useState<CurriculumImportPreview | null>(null);
  const [commitResult, setCommitResult] = useState<CurriculumImportCommitResult | null>(null);

  const {
    data: curriculaData,
    isLoading: isLoadingCurricula,
    error: curriculaError,
  } = useCurricula({ limit: 100 });

  const curricula = curriculaData?.data ?? [];

  useEffect(() => {
    if (curricula.length > 0 && !selectedCurriculumId) {
      const first = curricula[0];
      if (first) {
        setSelectedCurriculumId(first.id);
      }
    }
  }, [curricula, selectedCurriculumId]);

  const {
    data: curriculumDetail,
    isLoading: isLoadingDetail,
  } = useCurriculumDetails(selectedCurriculumId || null);

  const versions = curriculumDetail?.versions ?? [];

  useEffect(() => {
    if (versions.length > 0) {
      const draftOrActive =
        versions.find((v) => v.status === "ACTIVE") ||
        versions.find((v) => v.status === "DRAFT") ||
        versions[0];
      if (draftOrActive && (!selectedVersionId || !versions.some((v) => v.id === selectedVersionId))) {
        setSelectedVersionId(draftOrActive.id);
      }
    } else {
      setSelectedVersionId("");
    }
  }, [versions, selectedVersionId]);

  const previewMutation = usePreviewCurriculumImport();
  const commitMutation = useCommitCurriculumImport();

  const handleGeneratePreview = async (csvContent: string) => {
    if (!selectedVersionId) return;
    setCachedCsvContent(csvContent);

    try {
      const result = await previewMutation.mutateAsync({
        curriculumVersionId: selectedVersionId,
        csvContent,
      });
      setPreviewData(result);
      setStep("PREVIEW");
    } catch {
    }
  };

  const handleCommit = async () => {
    if (!selectedVersionId || !cachedCsvContent) return;

    try {
      const result = await commitMutation.mutateAsync({
        curriculumVersionId: selectedVersionId,
        csvContent: cachedCsvContent,
      });
      setCommitResult(result);
      setStep("SUCCESS");
    } catch {
    }
  };

  const handleReset = () => {
    setStep("UPLOAD");
    setCachedCsvContent("");
    setPreviewData(null);
    setCommitResult(null);
    previewMutation.reset();
    commitMutation.reset();
  };

  const handleCurriculumChange = (currId: string) => {
    setSelectedCurriculumId(currId);
    setSelectedVersionId("");
    if (step === "PREVIEW") setStep("UPLOAD");
  };

  const handleVersionChange = (verId: string) => {
    setSelectedVersionId(verId);
    if (step === "PREVIEW") setStep("UPLOAD");
  };

  const curriculumOptions: readonly SelectDropdownOption[] = useMemo(
    () =>
      curricula.map((c) => ({
        value: c.id,
        label: c.name,
        badge: c.code,
      })),
    [curricula]
  );

  const versionOptions: readonly SelectDropdownOption[] = useMemo(
    () =>
      versions.map((v) => ({
        value: v.id,
        label: v.name,
        badge: v.code,
      })),
    [versions]
  );

  if (isLoadingCurricula) {
    return (
      <div className="min-h-[300px] flex items-center justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (curriculaError) {
    return (
      <div className="py-4">
        <ErrorAlert message={getErrorMessage(curriculaError, "Failed to load curricula.")} />
      </div>
    );
  }

  if (curricula.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-dashed border-border p-8 text-center space-y-3 shadow-xs">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <BookOpen size={24} />
        </div>
        <h2 className="text-base font-bold text-foreground">
          No Curricula Available
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-12">
      {step !== "SUCCESS" && (
        <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <h2 className="text-base font-bold text-foreground">
              Target Curriculum
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
            <SelectDropdown
              label="Curriculum"
              value={selectedCurriculumId}
              onChange={handleCurriculumChange}
              options={curriculumOptions}
              placeholder="Select curriculum..."
            />
            <SelectDropdown
              label="Version"
              value={selectedVersionId}
              onChange={handleVersionChange}
              options={versionOptions}
              placeholder={versions.length === 0 ? "No versions available" : "Select version..."}
              disabled={versions.length === 0 || isLoadingDetail}
            />
          </div>
        </div>
      )}

      {step === "UPLOAD" && (
        <CurriculumImportUpload
          isPending={previewMutation.isPending}
          onGeneratePreview={handleGeneratePreview}
          error={
            previewMutation.error
              ? getErrorMessage(previewMutation.error, "Failed to validate import file.")
              : null
          }
        />
      )}

      {step === "PREVIEW" && previewData && (
        <CurriculumImportPreviewTable
          preview={previewData}
          isCommitting={commitMutation.isPending}
          onCommit={handleCommit}
          onBack={() => setStep("UPLOAD")}
          commitError={
            commitMutation.error
              ? getErrorMessage(commitMutation.error, "Failed to commit import.")
              : null
          }
        />
      )}

      {step === "SUCCESS" && commitResult && (
        <CurriculumImportResultCard
          result={commitResult}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
