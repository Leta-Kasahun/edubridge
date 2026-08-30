"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Upload, X, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  validateDocumentFile,
  fileToDataUrlAsync,
  isPdfDocument,
  isImageDocument,
} from "@/shared/utils/document.util";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { DocumentPreviewModal } from "@/shared/components/document/DocumentPreviewModal";

export interface DocumentUploadFieldProps {
  readonly initialDocumentUrl?: string | null;
  readonly onDocumentSelect?: (dataUrl: string | null) => void;
  readonly error?: string;
  readonly label?: string;
}

export function DocumentUploadField({
  initialDocumentUrl,
  onDocumentSelect,
  error,
  label = "Certificate / Degree Document (PDF or Image)",
}: DocumentUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialDocumentUrl || null
  );
  const [fileName, setFileName] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateDocumentFile(file, 10);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid document format");
      return;
    }

    setValidationError(null);
    setFileName(file.name);

    try {
      const dataUrl = await fileToDataUrlAsync(file);
      setPreviewUrl(dataUrl);
      onDocumentSelect?.(dataUrl);
    } catch {
      setValidationError("Failed to process document file");
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileName("");
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onDocumentSelect?.(null);
  };

  const displayError = error || validationError;
  const isPdf = isPdfDocument(previewUrl);
  const isImage = isImageDocument(previewUrl);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block">
          {label}
        </label>
      )}

      {previewUrl ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 min-w-0">
            {isImage ? (
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-border shrink-0 bg-background">
                <Image
                  src={previewUrl}
                  alt="Certificate preview"
                  fill
                  unoptimized
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <FileText size={24} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {fileName || (isPdf ? "Certificate_Document.pdf" : "Certificate_Image")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  <span>Preview</span>
                  <ExternalLink size={10} />
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Change file
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="self-end sm:self-auto p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            aria-label="Remove document"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed border-border hover:border-primary/50 bg-background/50 hover:bg-primary/5 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group",
            displayError && "border-destructive text-destructive bg-destructive/5"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Upload size={18} />
          </div>
          <p className="text-xs font-semibold text-foreground">
            Upload Certificate / Degree Document
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Supports PDF, JPG, PNG, WEBP (Max 10MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Document file input"
      />

      {displayError && <ErrorAlert message={displayError} />}

      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        documentUrl={previewUrl}
        title="Document Preview"
        fileName={fileName || "certificate_document"}
      />
    </div>
  );
}
