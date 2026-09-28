"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calendar } from "lucide-react";
import { LoadingSpinner } from "@/shared/components";
import { TopicMasteryBadge } from "./TopicMasteryBadge";
import { useTopicMasteryHistory } from "../hooks/useMastery";
import { MasteryLevel } from "../types/mastery.types";

interface MasteryHistoryModalProps {
  readonly open: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onClose?: () => void;
  readonly studentId: string;
  readonly studentName: string;
  readonly topicId: string;
  readonly topicTitle: string;
  readonly currentLevel: MasteryLevel;
  readonly currentAccuracy?: number | null;
}

export function MasteryHistoryModal({
  open,
  onOpenChange,
  onClose,
  studentId,
  studentName,
  topicId,
  topicTitle,
  currentLevel,
  currentAccuracy,
}: MasteryHistoryModalProps): React.JSX.Element | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const { data: history, isLoading } = useTopicMasteryHistory(
    studentId,
    topicId,
    open
  );

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="min-w-0 pr-4">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              Topic Progress
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {studentName} · {topicTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-100px)] overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Current Level
              </span>
              <div className="pt-0.5">
                <TopicMasteryBadge level={currentLevel} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Score
              </span>
              <p className="text-xs font-semibold text-foreground pt-0.5">
                {currentAccuracy !== null && currentAccuracy !== undefined
                  ? `${currentAccuracy}%`
                  : "—"}
              </p>
            </div>
          </div>

          {/* History Records */}
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
              <Calendar size={12} />
              Progress History
            </span>

            {isLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size={22} />
              </div>
            ) : !history || history.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4 text-center">
                No previous records found for this topic.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin pr-1">
                {history.map((item, idx) => {
                  const dateStr = item.calculatedAt
                    ? new Date(item.calculatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recorded";

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            Record {history.length - idx}
                          </span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">
                            {dateStr}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {item.evidenceCount}{" "}
                          {item.evidenceCount === 1 ? "question" : "questions"} answered
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.masteryScore !== null && (
                          <span className="font-semibold text-foreground text-xs tabular-nums">
                            {item.masteryScore}%
                          </span>
                        )}
                        <TopicMasteryBadge level={item.level} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
