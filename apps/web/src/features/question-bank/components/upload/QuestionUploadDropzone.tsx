"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { validateQuestionUploadFile } from "@/shared/utils/question-upload.util";
import { formatFileSize } from "@/shared/utils/document.util";
import {
  QUESTION_UPLOAD_ACCEPTED_EXTENSIONS,
  MAX_QUESTION_FILE_MB,
} from "@/shared/constants/question-bank.constants";
import { useUploadQuestionFile } from "../../hooks/useQuestionUpload";
import { QuestionUploadResponse } from "../../types/question-bank.types";

interface QuestionUploadDropzoneProps {
  readonly bankId: string;
  readonly onUploadSuccess: (response: QuestionUploadResponse) => void;
}

export function QuestionUploadDropzone({
  bankId,
  onUploadSuccess,
}: QuestionUploadDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadMutation = useUploadQuestionFile(bankId);

  const handleFile = (file: File) => {
    setErrorMessage(null);
    const validation = validateQuestionUploadFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid file format or size.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleStartExtraction = async () => {
    if (!selectedFile) return;
    try {
      const result = await uploadMutation.mutateAsync(selectedFile);
      onUploadSuccess(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to extract questions from document.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={QUESTION_UPLOAD_ACCEPTED_EXTENSIONS}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <UploadCloud size={24} />
        </div>

        <h4 className="text-sm font-bold text-foreground mb-1">
          Upload Document
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-2">
          Drag & drop your PDF, PNG, JPG, or WebP exam paper, or click to browse files.
        </p>
        <span className="inline-block text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
          Max {MAX_QUESTION_FILE_MB}MB
        </span>
      </div>

      {errorMessage && <ErrorAlert message={errorMessage} />}

      {selectedFile && (
        <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3 animate-in fade-in-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>

          <SubmitButton
            onClick={handleStartExtraction}
            isLoading={uploadMutation.isPending}
            loadingText="Extracting..."
            size="sm"
          >
            Extract Questions
          </SubmitButton>
        </div>
      )}
    </div>
  );
}
