"use client";

import { useState, useEffect, useMemo } from "react";
import { BookOpen, Layers, Plus } from "lucide-react";
import { useCurricula, useCurriculumDetails } from "../../curricula/hooks/useCurricula";
import { usePreviewCurriculumImport, useCommitCurriculumImport } from "../hooks/useCurriculumImport";
import {
  CurriculumFormModal,
  CurriculumVersionFormModal,
} from "../../curricula/components";
import { CurriculumImportUpload } from "./CurriculumImportUpload";
import { CurriculumImportPreviewTable } from "./CurriculumImportPreviewTable";
import { CurriculumImportResultCard } from "./CurriculumImportResultCard";
import {
  ImportStep,
  CurriculumImportPreview,
  CurriculumImportCommitResult,
} from "../types/import.types";
import {
  CurriculumItem,
  CurriculumDetailItem,
  CurriculumVersionItem,
} from "../../curricula/types/curriculum.types";
import {
  ErrorAlert,
  LoadingSpinner,
  TableToolbar,
  FilterGroup,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

export function CurriculumImportManager() {
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [step, setStep] = useState<ImportStep>("UPLOAD");
  const [cachedCsvContent, setCachedCsvContent] = useState<string>("");
  const [previewData, setPreviewData] = useState<CurriculumImportPreview | null>(null);
  const [commitResult, setCommitResult] = useState<CurriculumImportCommitResult | null>(null);

  const [isCreateCurriculumOpen, setIsCreateCurriculumOpen] = useState(false);
  const [isCreateVersionOpen, setIsCreateVersionOpen] = useState(false);

  const {
    data: curriculaData,
    isLoading: isLoadingCurricula,
    error: curriculaError,
  } = useCurricula({ limit: 100 });

  const curricula = curriculaData?.data ?? [];

  const defaultCurriculum = useMemo(
    () => curricula.find((c) => c.status === "ACTIVE") || curricula[0],
    [curricula]
  );
  const effectiveCurriculumId = selectedCurriculumId || defaultCurriculum?.id || "";

  const selectedCurriculum = useMemo<CurriculumItem | null>(() => {
    return curricula.find((c) => c.id === effectiveCurriculumId) || null;
  }, [curricula, effectiveCurriculumId]);

  const {
    data: curriculumDetail,
  } = useCurriculumDetails(effectiveCurriculumId || null);

  const versions = curriculumDetail?.versions ?? [];

  const defaultVersion = useMemo(
    () =>
      versions.find((v) => v.status === "ACTIVE") ||
      versions.find((v) => v.status === "DRAFT") ||
      versions[0],
    [versions]
  );
  const effectiveVersionId = selectedVersionId || defaultVersion?.id || "";

  const previewMutation = usePreviewCurriculumImport();
  const commitMutation = useCommitCurriculumImport();

  const handleGeneratePreview = async (csvContent: string) => {
    if (!effectiveVersionId) return;
    setCachedCsvContent(csvContent);

    try {
      const result = await previewMutation.mutateAsync({
        curriculumVersionId: effectiveVersionId,
        csvContent,
      });
      setPreviewData(result);
      setStep("PREVIEW");
    } catch {
    }
  };

  const handleCommit = async () => {
    if (!effectiveVersionId || !cachedCsvContent) return;

    try {
      const result = await commitMutation.mutateAsync({
        curriculumVersionId: effectiveVersionId,
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

  const handleCurriculumCreated = (newCurr: CurriculumDetailItem) => {
    setSelectedCurriculumId(newCurr.id);
    if (newCurr.versions && newCurr.versions.length > 0) {
      const firstVer = newCurr.versions[0];
      if (firstVer) {
        setSelectedVersionId(firstVer.id);
      }
    } else {
      setSelectedVersionId("");
    }
  };

  const handleVersionCreated = (newVer: CurriculumVersionItem) => {
    setSelectedVersionId(newVer.id);
  };

  const filterGroups: readonly FilterGroup[] = useMemo(() => {
    return [
      {
        id: "curriculum",
        label: "Curriculum",
        selectedValue: selectedCurriculumId || "ALL",
        options: curricula.map((c) => ({
          label: c.name,
          value: c.id,
        })),
        onSelect: (val) => handleCurriculumChange(val === "ALL" ? "" : val),
        icon: BookOpen,
      },
      {
        id: "version",
        label: "Version",
        selectedValue: selectedVersionId || "ALL",
        options: versions.map((v) => ({
          label: v.name,
          value: v.id,
        })),
        onSelect: (val) => handleVersionChange(val === "ALL" ? "" : val),
        icon: Layers,
      },
    ];
  }, [curricula, selectedCurriculumId, versions, selectedVersionId]);

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
      <div className="bg-card rounded-none border border-dashed border-border p-8 text-center space-y-4 shadow-xs">
        <div className="h-12 w-12 rounded-none bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <BookOpen size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            No Curricula Available
          </h2>
          <p className="text-xs text-muted-foreground">
            Create a curriculum to begin importing academic structures.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateCurriculumOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus size={13} />
          <span>Create Curriculum</span>
        </button>

        <CurriculumFormModal
          isOpen={isCreateCurriculumOpen}
          onClose={() => setIsCreateCurriculumOpen(false)}
          itemToEdit={null}
          onSuccess={handleCurriculumCreated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-12">
      {step !== "SUCCESS" && (
        <div className="bg-card rounded-none border border-border p-3.5 sm:p-4 shadow-xs">
          <TableToolbar
            searchValue=""
            onSearchChange={() => { }}
            searchPlaceholder="Curriculum import..."
            className="[&>div:first-child>div:first-child]:hidden [&_div:has(>input[type='search'])]:hidden"
            filters={filterGroups}
            actionButton={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCurriculumOpen(true)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-none text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <Plus size={14} />
                  <span>Curriculum</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateVersionOpen(true)}
                  disabled={!effectiveCurriculumId}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Plus size={14} />
                  <span>Version</span>
                </button>
              </div>
            }
          />
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

      <CurriculumFormModal
        isOpen={isCreateCurriculumOpen}
        onClose={() => setIsCreateCurriculumOpen(false)}
        itemToEdit={null}
        onSuccess={handleCurriculumCreated}
      />

      <CurriculumVersionFormModal
        isOpen={isCreateVersionOpen}
        onClose={() => setIsCreateVersionOpen(false)}
        curriculum={selectedCurriculum}
        onSuccess={handleVersionCreated}
      />
    </div>
  );
}
