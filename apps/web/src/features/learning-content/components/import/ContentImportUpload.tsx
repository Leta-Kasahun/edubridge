"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  FileText,
} from "lucide-react";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { parseImportFile } from "@/shared/utils/csv-parser";
import { contentImportService } from "../../services/content-import.service";

export interface ContentImportUploadProps {
  readonly isPending: boolean;
  readonly onGeneratePreview: (csvContent: string) => Promise<void>;
  readonly error: string | null;
}

export function ContentImportUpload({
  isPending,
  onGeneratePreview,
  error,
}: ContentImportUploadProps) {
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
        ["title", "type", "topicCode"]
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

  const handleDownloadTemplate = async () => {
    try {
      const csv = await contentImportService.downloadTemplate();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "learning_content_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setLocalError("Failed to download CSV template");
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

  const displayError = error || localError;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <h2 className="text-sm sm:text-base font-bold text-foreground">
            Download Standard Template
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <FileText size={13} className="text-primary" />
              <span>CSV Template</span>
            </button>
          </div>
        </div>

        {displayError && <ErrorAlert message={displayError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center justify-center p-6 sm:p-10 border-2 border-dashed border-border hover:border-primary/60 rounded-xl bg-muted/20 hover:bg-primary/5 transition-all cursor-pointer text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFileChange(selected);
              }}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet size={20} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {Math.round(file.size / 1024)} KB &bull; Ready to validate
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-destructive hover:underline cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Remove file</span>
                </button>
              </div>
            ) : (
              <>
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-bold text-foreground">
                  Click to upload or drag &amp; drop file
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                  Supports CSV, XLSX, and XLS formats up to 10MB
                </p>
              </>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <SubmitButton
              isLoading={isPending}
              loadingText="Validating CSV rows..."
              disabled={!file || !csvContent}
              size="sm"
            >
              Validate &amp; Preview
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
