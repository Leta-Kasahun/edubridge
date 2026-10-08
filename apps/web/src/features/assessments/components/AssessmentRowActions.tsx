"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  MoreVertical,
  Trash2,
  Users,
  Send,
  Play,
  SlidersHorizontal,
  Layers,
  Settings2,
  RotateCcw,
} from "lucide-react";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { AssessmentItem } from "../types/assessment.types";
import { ROUTES } from "@/constants/routes";

export interface AssessmentRowActionsProps {
  readonly assessment: AssessmentItem;
  readonly onManageQuestions?: (assessment: AssessmentItem) => void;
  readonly onAssign: (assessment: AssessmentItem) => void;
  readonly onPublish?: (assessment: AssessmentItem) => void;
  readonly onUnarchive?: (assessment: AssessmentItem) => void;
  readonly onViewResults?: (assessment: AssessmentItem) => void;
  readonly onEdit: (assessment: AssessmentItem) => void;
  readonly onDelete: (assessment: AssessmentItem) => void;
  readonly isBusy?: boolean;
}

export function AssessmentRowActions({
  assessment,
  onManageQuestions,
  onAssign,
  onPublish,
  onUnarchive,
  onEdit,
  onDelete,
  isBusy = false,
}: AssessmentRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 216;
    const menuHeight = 240;

    let top = rect.bottom + 6;
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(10, rect.top - menuHeight - 6);
    }

    let left = rect.right - menuWidth;
    if (left < 10) {
      left = 10;
    } else if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScroll = () => updatePosition();
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const isPublishedOrActive =
    assessment.status === "PUBLISHED" || assessment.status === "ACTIVE";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        disabled={isBusy}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden cursor-pointer disabled:opacity-50 transition-colors"
        aria-label="Assessment Actions"
        aria-expanded={isOpen}
      >
        {isBusy ? <LoadingSpinner size={14} /> : <MoreVertical size={16} />}
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            className="w-54 bg-card text-foreground border border-border rounded-xl shadow-xl p-1.5 animate-in fade-in-0 zoom-in-95 text-xs select-none"
          >
            {isPublishedOrActive && (
              <Link
                href={ROUTES.ASSESSMENTS.ATTEMPT(assessment.id)}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <Play size={14} className="text-primary fill-primary/20 shrink-0" />
                <span>Launch / Preview</span>
              </Link>
            )}

            <Link
              href={`/dashboard/assessments/${assessment.id}`}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
            >
              <SlidersHorizontal size={14} className="text-primary shrink-0" />
              <span>Manage Questions</span>
            </Link>

            {onManageQuestions ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onManageQuestions(assessment);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <Layers size={14} className="text-primary shrink-0" />
                <span>Add from Bank</span>
              </button>
            ) : (
              <Link
                href={`/dashboard/assessments/${assessment.id}?mode=bank`}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <Layers size={14} className="text-primary shrink-0" />
                <span>Add from Bank</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onAssign(assessment);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
            >
              <Users size={14} className="text-muted-foreground shrink-0" />
              <span>Assign to Sections</span>
            </button>

            {(assessment.status === "DRAFT" || assessment.status === "ARCHIVED") && onPublish && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onPublish(assessment);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <Send size={14} className="shrink-0" />
                <span>{assessment.status === "ARCHIVED" ? "Publish Again" : "Publish Assessment"}</span>
              </button>
            )}

            {assessment.status === "ARCHIVED" && onUnarchive && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onUnarchive(assessment);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <RotateCcw size={14} className="text-primary shrink-0" />
                <span>Restore to Draft</span>
              </button>
            )}

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit(assessment);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
            >
              <Settings2 size={14} className="shrink-0" />
              <span>Edit Settings</span>
            </button>

            {assessment.status !== "ARCHIVED" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDelete(assessment);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <Trash2 size={14} className="shrink-0" />
                <span>Archive Assessment</span>
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}


