"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  BookOpen,
  Layers,
  ChevronDown,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
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
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
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
  } = useCurriculumDetails(selectedCurriculumId);

  const versions = curriculumDetail?.versions ?? [];

  useEffect(() => {
    if (versions.length > 0) {
      const draftOrActive =
        versions.find((v) => v.status === "DRAFT") ||
        versions.find((v) => v.status === "ACTIVE") ||
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

  if (isLoadingCurricula) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size={32} />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Loading curriculum catalog...
        </p>
      </div>
    );
  }

  if (curriculaError) {
    return (
      <div className="py-8">
        <ErrorAlert message={getErrorMessage(curriculaError, "Failed to load curricula.")} />
      </div>
    );
  }

  if (curricula.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center bg-white dark:bg-slate-900">
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Curricula Available
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Please create a curriculum package first in the Curricula section before importing structure data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Target Version Selector */}
      {step !== "SUCCESS" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Target Curriculum
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                Select Destination Version
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative min-w-[200px]">
                <select
                  value={selectedCurriculumId}
                  onChange={(e) => {
                    setSelectedCurriculumId(e.target.value);
                    if (step === "PREVIEW") setStep("UPLOAD");
                  }}
                  className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 pr-8 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {curricula.map((curr) => (
                    <option key={curr.id} value={curr.id}>
                      {curr.name} ({curr.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              <div className="relative min-w-[180px]">
                <select
                  value={selectedVersionId}
                  disabled={versions.length === 0 || isLoadingDetail}
                  onChange={(e) => {
                    setSelectedVersionId(e.target.value);
                    if (step === "PREVIEW") setStep("UPLOAD");
                  }}
                  className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 pr-8 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                >
                  {versions.length === 0 ? (
                    <option value="">No versions available</option>
                  ) : (
                    versions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.code}) - {v.status}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Views */}
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
