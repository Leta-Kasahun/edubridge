"use client";

import { useState } from "react";
import { UploadCloud, X, FileCheck } from "lucide-react";
import { QuestionUploadResponse } from "../../types/question-bank.types";
import { QuestionUploadDropzone } from "./QuestionUploadDropzone";
import { QuestionUploadPreviewTable } from "./QuestionUploadPreviewTable";

interface QuestionUploadModalProps {
  readonly bankId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function QuestionUploadModal({
  bankId,
  isOpen,
  onClose,
}: QuestionUploadModalProps) {
  const [uploadPreviewData, setUploadPreviewData] = useState<QuestionUploadResponse | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setUploadPreviewData(null);
    onClose();
  };

  const isPreview = Boolean(uploadPreviewData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className={`relative w-full ${
          isPreview ? "max-w-5xl" : "max-w-xl"
        } bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 my-auto max-h-[92vh] flex flex-col transition-all duration-300`}
      >
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {isPreview ? <FileCheck size={18} /> : <UploadCloud size={18} />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                {isPreview ? "Review & Import Extracted Questions" : "Upload Questions Document"}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {isPreview
                  ? "Verify, edit inline, and select questions extracted from your document"
                  : "Upload an exam paper (PDF, Image) to automatically extract questions"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!uploadPreviewData ? (
            <QuestionUploadDropzone
              bankId={bankId}
              onUploadSuccess={(res) => setUploadPreviewData(res)}
            />
          ) : (
            <QuestionUploadPreviewTable
              bankId={bankId}
              uploadData={uploadPreviewData}
              onComplete={handleClose}
              onCancel={() => setUploadPreviewData(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

