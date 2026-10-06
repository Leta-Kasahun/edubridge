"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Target,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import {
  useContentDetail,
  useContentList,
  useContentProgress,
  useSaveContentProgress,
} from "../../hooks/useLearningContent";
import { LearningContentListItem } from "../../types/content.types";
import { isPdfDocument, downloadFileFromDataUrl } from "@/shared/utils/document.util";
import { env } from "@/config/env";
import { getAccessToken } from "@/lib/apiClient";

interface StudentMaterialReaderViewProps {
  readonly contentId: string;
}

export function StudentMaterialReaderView({
  contentId,
}: StudentMaterialReaderViewProps): React.JSX.Element {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const hasSeekedRef = React.useRef(false);
  const lastSyncTimeRef = React.useRef<number>(0);

  const { data: savedProgress } = useContentProgress(contentId);
  const saveProgressMutation = useSaveContentProgress(contentId);

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
  } = useContentDetail(contentId);

  const subjectId = detail?.subjectId || undefined;

  const { data: siblingData } = useContentList({
    subjectId,
    limit: 100,
  });

  const orderedMaterials: readonly LearningContentListItem[] = useMemo(() => {
    const items = [...(siblingData?.data ?? [])];
    return items.sort((a, b) => {
      const unitA = a.unitTitle || "";
      const unitB = b.unitTitle || "";
      if (unitA !== unitB) {
        return unitA.localeCompare(unitB, undefined, { numeric: true });
      }
      const topicA = a.primaryTopic?.topicCode || a.primaryTopic?.topicTitle || "";
      const topicB = b.primaryTopic?.topicCode || b.primaryTopic?.topicTitle || "";
      if (topicA !== topicB) {
        return topicA.localeCompare(topicB, undefined, { numeric: true });
      }
      return a.title.localeCompare(b.title);
    });
  }, [siblingData]);

  const currentIndex = useMemo(() => {
    return orderedMaterials.findIndex((m) => m.id === contentId);
  }, [orderedMaterials, contentId]);

  const previousMaterial = currentIndex > 0 ? orderedMaterials[currentIndex - 1] : null;
  const nextMaterial =
    currentIndex >= 0 && currentIndex < orderedMaterials.length - 1
      ? orderedMaterials[currentIndex + 1]
      : null;

  const activeVersion = detail?.currentVersionDetail;
  const attachments = detail?.attachments ?? [];
  const primaryAttachment = attachments[0] || null;

  const primaryTopic = useMemo(() => {
    if (!detail?.topics || detail.topics.length === 0) return null;
    return detail.topics.find((t) => t.isPrimary) || detail.topics[0] || null;
  }, [detail]);

  const primaryMediaUrl = useMemo(() => {
    const rawUrl = primaryAttachment?.deliveryUrl || activeVersion?.body?.resourceUrl;
    if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
      return null;
    }
    const cleanUrl = rawUrl.trim();
    if (
      cleanUrl.startsWith("http://") ||
      cleanUrl.startsWith("https://") ||
      cleanUrl.startsWith("blob:") ||
      cleanUrl.startsWith("data:")
    ) {
      return cleanUrl;
    }

    const token = getAccessToken();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    const cleanPath = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;

    return `${cleanPath}${tokenQuery}`;
  }, [primaryAttachment, activeVersion]);

  const isPdf = isPdfDocument(primaryMediaUrl) || detail?.type === "PDF" || detail?.type === "TEXTBOOK" || detail?.type === "REFERENCE_BOOK";
  const isVideo = detail?.type === "VIDEO";

  const handleDownloadPrimary = () => {
    if (!primaryMediaUrl) return;
    const name = primaryAttachment?.fileName || `${detail?.title || "learning_material"}.pdf`;
    downloadFileFromDataUrl(primaryMediaUrl, name);
  };

  // Resume video playback to saved position on initial load
  React.useEffect(() => {
    if (
      savedProgress?.lastPositionSeconds &&
      videoRef.current &&
      !hasSeekedRef.current &&
      savedProgress.lastPositionSeconds > 0
    ) {
      videoRef.current.currentTime = savedProgress.lastPositionSeconds;
      hasSeekedRef.current = true;
    }
  }, [savedProgress]);

  // Initial read progress beacon (for text, lesson, pdf)
  React.useEffect(() => {
    if (detail && !savedProgress) {
      saveProgressMutation.mutate({
        lastPositionSeconds: 0,
        durationSeconds: 0,
        progressPercent: 10,
        isCompleted: false,
      });
    }
  }, [detail, savedProgress, saveProgressMutation]);

  const handleVideoTimeUpdate = React.useCallback(() => {
    if (!videoRef.current) return;
    const now = Date.now();
    // Throttled sync every 6 seconds
    if (now - lastSyncTimeRef.current > 6000) {
      lastSyncTimeRef.current = now;
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      const pct = Math.min(100, Math.round((current / duration) * 100));
      saveProgressMutation.mutate({
        lastPositionSeconds: current,
        durationSeconds: duration,
        progressPercent: pct,
        isCompleted: pct >= 90,
      });
    }
  }, [saveProgressMutation]);

  const handleVideoEnded = React.useCallback(() => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration || 1;
    saveProgressMutation.mutate({
      lastPositionSeconds: duration,
      durationSeconds: duration,
      progressPercent: 100,
      isCompleted: true,
    });
  }, [saveProgressMutation]);

  if (isDetailLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="h-16 border-b border-border bg-card/60 animate-pulse" />
        <div className="flex-1 flex p-6 gap-6">
          <div className="w-80 h-[80vh] rounded-2xl bg-muted/40 animate-pulse hidden lg:block" />
          <div className="flex-1 h-[80vh] rounded-2xl bg-muted/40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isDetailError || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-foreground">Material Not Found</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            {detailError instanceof Error ? detailError.message : "The requested learning material is unavailable."}
          </p>
          <Link
            href="/dashboard/learning-content/materials"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Materials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/learning-content/materials"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
            title="Exit learning mode"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Exit</span>
          </Link>

          <div className="h-5 w-px bg-border/80 hidden sm:block shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                {detail.subjectName || "General"}
              </span>
              {currentIndex >= 0 && orderedMaterials.length > 0 && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Lesson {currentIndex + 1} of {orderedMaterials.length}
                </span>
              )}
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-foreground truncate mt-0.5">
              {detail.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {primaryMediaUrl && (
            <button
              type="button"
              onClick={handleDownloadPrimary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
          >
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="hidden md:inline">{sidebarOpen ? "Hide Outline" : "Lesson Outline"}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <aside className="w-full sm:w-80 md:w-88 shrink-0 border-r border-border bg-card/60 flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto z-30">
            <div className="p-4 border-b border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Lesson Outline
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition sm:hidden cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
              {orderedMaterials.map((item, idx) => {
                const isActive = item.id === contentId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(`/learn/${item.id}`)}
                    className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-snug line-clamp-2">
                        {item.title}
                      </p>
                      {item.primaryTopic?.topicTitle && (
                        <p
                          className={`text-[10px] mt-0.5 truncate ${
                            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          {item.primaryTopic.topicTitle}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-5xl w-full mx-auto space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  {detail.unitTitle && <span>Unit: {detail.unitTitle}</span>}
                  {primaryTopic?.topicTitle && (
                    <>
                      <span>·</span>
                      <span>Topic: {primaryTopic.topicTitle}</span>
                    </>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {detail.title}
                </h2>
                {detail.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {detail.description}
                  </p>
                )}
              </div>

              {isVideo && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
                  {primaryMediaUrl ? (
                    <video
                      ref={videoRef}
                      src={primaryMediaUrl}
                      controls
                      onTimeUpdate={handleVideoTimeUpdate}
                      onPause={handleVideoTimeUpdate}
                      onEnded={handleVideoEnded}
                      className="w-full aspect-video rounded-2xl bg-black"
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <div className="aspect-video flex flex-col items-center justify-center text-white/60 p-6 text-center">
                      <Video className="h-12 w-12 mb-2 text-white/40" />
                      <p className="text-sm">Video media is currently unavailable.</p>
                    </div>
                  )}
                </div>
              )}

              {isPdf && primaryMediaUrl && (
                <div className={`mb-8 rounded-2xl border border-border overflow-hidden bg-muted/20 shadow-inner transition-all ${isFullscreen ? "fixed inset-4 z-50 bg-background" : ""}`}>
                  <div className="flex items-center justify-between p-3 bg-muted/40 border-b border-border text-xs text-muted-foreground flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Digital Document Viewer</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(z + 15, 175))}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer"
                        title="Zoom Out"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer"
                        title="Rotate"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer text-xs"
                      >
                        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                        <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative overflow-auto bg-muted/30 flex justify-center p-2">
                    <iframe
                      src={`${primaryMediaUrl}#toolbar=0`}
                      title={detail.title}
                      style={{
                        transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                        transformOrigin: "top center",
                      }}
                      className={`w-full rounded-b-2xl border-none transition-transform duration-200 ${
                        isFullscreen ? "h-[88vh]" : "h-[650px]"
                      }`}
                    />
                  </div>
                </div>
              )}

              {activeVersion?.body?.text && (
                <div className="prose dark:prose-invert max-w-none mb-8">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 sm:p-8 leading-relaxed whitespace-pre-line text-foreground text-sm sm:text-base">
                    {activeVersion.body.text}
                  </div>
                </div>
              )}

              {detail.objectives && detail.objectives.length > 0 && (
                <div className="mb-8 space-y-3 rounded-2xl border border-border bg-muted/30 p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Learning Objectives
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {detail.objectives.map((obj) => (
                      <li key={obj.objectiveId} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-foreground">{obj.objectiveCode}:</strong> {obj.objectiveStatement}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="space-y-3 border-t border-border pt-6">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Attached Resources ({attachments.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.deliveryUrl}
                        download={att.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-xs font-medium text-foreground truncate">
                            {att.fileName}
                          </span>
                        </div>
                        <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
              {previousMaterial ? (
                <Link
                  href={`/learn/${previousMaterial.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 text-xs sm:text-sm font-semibold text-foreground shadow-xs hover:border-primary hover:text-primary transition group"
                >
                  <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                  <div className="text-left">
                    <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">
                      Previous Lesson
                    </span>
                    <span className="line-clamp-1">{previousMaterial.title}</span>
                  </div>
                </Link>
              ) : (
                <div className="w-full sm:w-auto opacity-40 cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-xs sm:text-sm font-semibold text-muted-foreground">
                  <ChevronLeft className="h-4 w-4" />
                  <span>First Lesson</span>
                </div>
              )}

              {nextMaterial ? (
                <Link
                  href={`/learn/${nextMaterial.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition group"
                >
                  <div className="text-right">
                    <span className="block text-[10px] text-primary-foreground/80 uppercase tracking-wider">
                      Next Lesson
                    </span>
                    <span className="line-clamp-1">{nextMaterial.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <div className="w-full sm:w-auto opacity-40 cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-xs sm:text-sm font-semibold text-muted-foreground">
                  <span>Completed All Lessons</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
