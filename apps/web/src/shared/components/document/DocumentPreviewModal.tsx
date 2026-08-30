"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isPdfDocument,
  isImageDocument,
  downloadFileFromDataUrl,
  printDocumentFromUrl,
} from "@/shared/utils/document.util";

export interface DocumentPreviewModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly documentUrl: string | null;
  readonly title?: string;
  readonly subtitle?: string;
  readonly fileName?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  documentUrl,
  title = "Certificate Document",
  subtitle,
  fileName = "certificate_document",
}: DocumentPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setRotation(0);
      setCurrentPage(1);
    }
  }, [isOpen, documentUrl]);

  if (!isOpen || !mounted || !documentUrl) return null;

  const isPdf = isPdfDocument(documentUrl);
  const isImage = isImageDocument(documentUrl);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => {
    setZoom(100);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleToggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleDownload = () => {
    const extension = isPdf ? ".pdf" : isImage ? ".jpg" : "";
    const name = fileName.includes(".") ? fileName : `${fileName}${extension}`;
    downloadFileFromDataUrl(documentUrl, name);
  };

  const handlePrint = () => {
    printDocumentFromUrl(documentUrl);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-background/85 backdrop-blur-sm overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-10 w-full bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col my-auto transition-all duration-200 animate-in fade-in zoom-in-95",
          isFullscreen
            ? "fixed inset-2 sm:inset-4 max-w-none h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)]"
            : "max-w-4xl max-h-[90vh]"
        )}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border bg-card/90 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-muted text-foreground border border-border shrink-0">
              {isPdf ? <FileText size={18} /> : <Eye size={18} />}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {title}
              </h2>
              <p className="text-[11px] text-muted-foreground truncate">
                {subtitle || (isPdf ? "Verified PDF Certificate" : isImage ? "Verified Image Certificate" : "Attached Document")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer inline-flex items-center gap-1"
              title="Open full document"
              aria-label="Open full document"
            >
              <ArrowUpRight size={15} />
            </a>

            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 sm:p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="Print document"
              aria-label="Print document"
            >
              <Printer size={15} />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 sm:p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="Download file"
              aria-label="Download file"
            >
              <Download size={15} />
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="hidden sm:inline-flex p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer ml-1"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2 border-b border-border bg-muted/30 text-xs shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer disabled:opacity-40"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[11px] font-mono font-semibold text-foreground px-1 min-w-[45px] text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 250}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer disabled:opacity-40"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer ml-0.5"
              title="Reset view"
              aria-label="Reset view"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Rotate 90 degrees"
              aria-label="Rotate 90 degrees"
            >
              <RotateCw size={14} />
            </button>
          </div>

          {isPdf && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-[11px] font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-muted/10 min-h-[350px] sm:min-h-[500px]">
          {isImage ? (
            <div
              className="transition-transform duration-150 flex items-center justify-center"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            >
              <div className="relative max-w-full max-h-[70vh] rounded-xl overflow-hidden shadow-md bg-background">
                <Image
                  src={documentUrl}
                  alt={title}
                  width={900}
                  height={650}
                  unoptimized
                  className="object-contain max-h-[65vh] w-auto h-auto"
                />
              </div>
            </div>
          ) : isPdf ? (
            <div
              className="w-full h-full min-h-[450px] sm:min-h-[600px] flex items-center justify-center transition-transform duration-150"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            >
              <iframe
                src={`${documentUrl}#page=${currentPage}&toolbar=0&navpanes=0`}
                title="PDF Document"
                className="w-full h-[60vh] sm:h-[70vh] rounded-xl border border-border bg-background shadow-xs"
              />
            </div>
          ) : (
            <div className="text-center p-8 space-y-3">
              <FileText size={48} className="text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                Document preview is ready
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <Download size={14} />
                <span>Download Attachment</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
