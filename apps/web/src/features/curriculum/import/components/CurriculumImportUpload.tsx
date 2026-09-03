"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Trash2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { parseImportFile } from "@/shared/utils/csv-parser";
import { curriculumImportService } from "../services/import.service";

export interface CurriculumImportUploadProps {
  readonly isPending: boolean;
  readonly onGeneratePreview: (csvContent: string) => Promise<void>;
  readonly error: string | null;
}

export function CurriculumImportUpload({
  isPending,
  onGeneratePreview,
  error,
}: CurriculumImportUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setCsvContent(extractedCsv);
    } catch {
      setLocalError("Failed to read the selected file. Please verify its format.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setCsvContent("");
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent) {
      setLocalError("Please upload a file before continuing");
      return;
    }
    await onGeneratePreview(csvContent);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Download Template
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Use the standard Ethiopian curriculum template to prepare your structure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => curriculumImportService.downloadCsvTemplate()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Download CSV
            </button>
            <button
              type="button"
              onClick={() => curriculumImportService.downloadExcelTemplate()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              Download Excel (.xlsx)
            </button>
          </div>
        </div>

        {(localError || error) && (
          <div className="mt-5">
            <ErrorAlert message={localError || error || "An error occurred"} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFileChange(selected);
              }}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Click to select or drag and drop your file here
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports CSV (.csv) and Excel (.xlsx, .xls) up to 15MB
            </p>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <SubmitButton
              isLoading={isPending}
              disabled={!file || !csvContent}
              className="w-full sm:w-auto"
            >
              Preview & Validate
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
