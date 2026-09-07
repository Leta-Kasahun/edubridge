"use client";

import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Upload Questions Document
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
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
