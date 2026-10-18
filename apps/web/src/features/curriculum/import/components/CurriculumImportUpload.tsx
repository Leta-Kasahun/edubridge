"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  FileText,
} from "lucide-react";
import { SubmitButton, ErrorAlert } from "@/shared/components";
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
    <div className="space-y-4">
      <div className="bg-card rounded-none border border-border p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <h2 className="text-sm sm:text-base font-bold text-foreground">
            Download Template
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => curriculumImportService.downloadCsvTemplate()}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-none text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
            >
              <FileText size={13} className="text-primary" />
              <span>CSV Template</span>
            </button>
            <button
              type="button"
              onClick={() => curriculumImportService.downloadExcelTemplate()}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-none text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet size={13} className="text-emerald-500" />
              <span>Excel (.xlsx) Template</span>
            </button>
          </div>
        </div>

        {(localError || error) && (
          <ErrorAlert message={localError || error || "An error occurred"} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center justify-center p-6 sm:p-10 border-2 border-dashed border-border hover:border-primary/60 rounded-none bg-muted/20 hover:bg-primary/5 transition-all cursor-pointer text-center"
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
            <div className="h-10 w-10 rounded-none bg-primary/10 text-primary flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Upload size={20} />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              Choose or drop CSV or Excel file here
            </p>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 rounded-none border border-border bg-muted/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-none bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Remove file"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <SubmitButton
              isLoading={isPending}
              disabled={!file || !csvContent}
              className="w-full sm:w-auto h-9 sm:h-9 text-xs font-semibold px-4 rounded-none shadow-2xs"
            >
              Preview & Validate
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
