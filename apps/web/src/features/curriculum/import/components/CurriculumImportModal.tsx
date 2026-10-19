"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { X, Upload, FileSpreadsheet, FileText, Plus, BookOpen, Layers } from "lucide-react";
import { useCurricula, useCurriculumDetails } from "../../curricula/hooks/useCurricula";
import { usePreviewCurriculumImport, useCommitCurriculumImport } from "../hooks/useCurriculumImport";
import {
  CurriculumFormModal,
  CurriculumVersionFormModal,
} from "../../curricula/components";
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
  SelectDropdown,
  SelectDropdownOption,
  SubmitButton,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { parseImportFile } from "@/shared/utils/csv-parser";
import { curriculumImportService } from "../services/import.service";

export interface CurriculumImportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function CurriculumImportModal({
  isOpen,
  onClose,
}: CurriculumImportModalProps) {
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [step, setStep] = useState<ImportStep>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [cachedCsvContent, setCachedCsvContent] = useState<string>("");
  const [previewData, setPreviewData] = useState<CurriculumImportPreview | null>(null);
  const [commitResult, setCommitResult] = useState<CurriculumImportCommitResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const [isCreateCurriculumOpen, setIsCreateCurriculumOpen] = useState(false);
  const [isCreateVersionOpen, setIsCreateVersionOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isOpen) {
      setStep("UPLOAD");
      setFile(null);
      setCachedCsvContent("");
      setPreviewData(null);
      setCommitResult(null);
      setLocalError(null);
      previewMutation.reset();
      commitMutation.reset();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isCreateCurriculumOpen && !isCreateVersionOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCreateCurriculumOpen, isCreateVersionOpen, onClose]);

  const curriculumOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return curricula.map((c) => ({
      value: c.id,
      label: c.name,
      description: `${c.code} • ${c.status}`,
      badge: c.code,
    }));
  }, [curricula]);

  const versionOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return versions.map((v) => ({
      value: v.id,
      label: v.name,
      description: `Status: ${v.status}`,
      badge: v.status,
    }));
  }, [versions]);

  const handleFileChange = async (selectedFile: File) => {
    setLocalError(null);
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const hasValidExtension = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      setLocalError("Please select a valid CSV (.csv) or Excel (.xlsx, .xls) file");
      return;
    }

    try {
      const { csvContent: extractedCsv, parseResult } = await parseImportFile(
        selectedFile,
        ["gradeLevel", "subjectName", "unitTitle", "topicTitle", "objectiveStatement"]
      );

      if (parseResult.totalRows === 0) {
        setLocalError("The selected file contains no data rows");
        return;
      }

      setFile(selectedFile);
      setCachedCsvContent(extractedCsv);
    } catch {
      setLocalError("Failed to read the selected file. Please verify its format.");
    }
  };

  const handleGeneratePreview = async () => {
    if (!effectiveVersionId) {
      setLocalError("Please select a curriculum and version before continuing.");
      return;
    }
    if (!cachedCsvContent) {
      setLocalError("Please select a file to import.");
      return;
    }

    try {
      const result = await previewMutation.mutateAsync({
        curriculumVersionId: effectiveVersionId,
        csvContent: cachedCsvContent,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl bg-card rounded-none border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto min-w-0 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              Import Curriculum (CSV / Excel)
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
              Upload academic structure, subjects, units, and learning objectives
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-w-0">
          {isLoadingCurricula ? (
            <div className="min-h-[250px] flex items-center justify-center p-8">
              <LoadingSpinner size={32} />
            </div>
          ) : curriculaError ? (
            <ErrorAlert message={getErrorMessage(curriculaError, "Failed to load curricula.")} />
          ) : (
            <>
              {step === "UPLOAD" && (
                <div className="space-y-4">
                  {/* Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <BookOpen size={13} className="text-muted-foreground" />
                          <span>Curriculum</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCreateCurriculumOpen(true)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          <Plus size={11} />
                          <span>New</span>
                        </button>
                      </div>
                      <SelectDropdown
                        value={effectiveCurriculumId}
                        onChange={(val) => {
                          setSelectedCurriculumId(val);
                          setSelectedVersionId("");
                        }}
                        options={curriculumOptions}
                        placeholder="Select curriculum..."
                        searchable
                        searchPlaceholder="Search curriculum..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Layers size={13} className="text-muted-foreground" />
                          <span>Version</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCreateVersionOpen(true)}
                          disabled={!effectiveCurriculumId}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Plus size={11} />
                          <span>New</span>
                        </button>
                      </div>
                      <SelectDropdown
                        value={effectiveVersionId}
                        onChange={(val) => setSelectedVersionId(val)}
                        options={versionOptions}
                        placeholder={versions.length === 0 ? "No versions available" : "Select version..."}
                        disabled={!effectiveCurriculumId || versions.length === 0}
                        searchable
                        searchPlaceholder="Search version..."
                      />
                    </div>
                  </div>

                  {/* Sample Template Downloads */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-none bg-muted/20 border border-border gap-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={15} className="text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs text-foreground font-medium block truncate">
                          Download sample template
                        </span>
                        <span className="text-[11px] text-muted-foreground block truncate">
                          Supported columns: gradeLevel, subjectName, unitTitle, topicTitle, objectiveStatement
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => curriculumImportService.downloadExcelTemplate()}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileSpreadsheet size={13} className="text-emerald-500" />
                        <span>Excel (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => curriculumImportService.downloadCsvTemplate()}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileText size={13} className="text-primary" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  {(localError || previewMutation.error) && (
                    <ErrorAlert
                      message={
                        localError ||
                        (previewMutation.error
                          ? getErrorMessage(previewMutation.error, "Failed to validate import file.")
                          : "An error occurred")
                      }
                    />
                  )}

                  {/* Drag and Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/60 rounded-none p-5 sm:p-7 text-center cursor-pointer transition-colors bg-background/50 flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected) handleFileChange(selected);
                      }}
                      className="hidden"
                    />
                    <div className="p-3 rounded-none bg-muted text-muted-foreground">
                      <Upload size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground block">
                        {file ? file.name : "Click to select or drag and drop Excel (.xlsx, .xls) or CSV"}
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        Import academic structure directly into selected curriculum version
                      </span>
                    </div>
                  </div>

                  {file && (
                    <div className="p-3 rounded-none bg-background/50 border border-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileSpreadsheet size={15} className="text-primary shrink-0" />
                        <span className="font-medium text-foreground truncate max-w-[240px] sm:max-w-[360px]">
                          {file.name}
                        </span>
                      </div>
                      <span className="text-muted-foreground shrink-0 font-mono text-[11px]">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-3.5 sm:pt-4 border-t border-border mt-auto shrink-0">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-4 h-9 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-none transition-colors cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <SubmitButton
                      type="button"
                      disabled={!file || !cachedCsvContent || !effectiveVersionId || previewMutation.isPending}
                      isLoading={previewMutation.isPending}
                      loadingText="Validating..."
                      onClick={handleGeneratePreview}
                      className="w-full sm:w-auto h-9 px-5 text-xs font-semibold rounded-none shadow-2xs"
                    >
                      Preview & Validate
                    </SubmitButton>
                  </div>
                </div>
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
                <div className="space-y-4">
                  <CurriculumImportResultCard
                    result={commitResult}
                    onReset={() => {
                      setStep("UPLOAD");
                      setFile(null);
                      setCachedCsvContent("");
                      setPreviewData(null);
                      setCommitResult(null);
                    }}
                  />
                  <div className="flex justify-end pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-5 h-9 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals for creating new curriculum or version from within import dialog */}
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
    </div>
  );
}
