"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Layers,
  Users,
  Send,
  BarChart3,
  Play,
} from "lucide-react";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { AssessmentItem } from "../types/assessment.types";
import { ROUTES } from "@/constants/routes";

export interface AssessmentRowActionsProps {
  readonly assessment: AssessmentItem;
  readonly onManageQuestions: (assessment: AssessmentItem) => void;
  readonly onAssign: (assessment: AssessmentItem) => void;
  readonly onPublish?: (assessment: AssessmentItem) => void;
  readonly onViewResults: (assessment: AssessmentItem) => void;
  readonly onEdit: (assessment: AssessmentItem) => void;
  readonly onDelete: (assessment: AssessmentItem) => void;
  readonly isBusy?: boolean;
}

export function AssessmentRowActions({
  assessment,
  onManageQuestions,
  onAssign,
  onPublish,
  onViewResults,
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
    const menuWidth = 192;
    const menuHeight = 250;

    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(10, rect.top - menuHeight - 4);
    }

    let left = rect.right - menuWidth;
    if (left < 10) {
      left = 10;
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
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden cursor-pointer disabled:opacity-50"
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
            className="w-48 bg-card text-foreground border border-border rounded-xl shadow-lg p-1 animate-in fade-in-0 zoom-in-95 text-xs"
          >
            {isPublishedOrActive && (
              <Link
                href={ROUTES.ASSESSMENTS.ATTEMPT(assessment.id)}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
              >
                <Play size={13} className="text-primary fill-primary/20 shrink-0" />
                <span>Launch / Preview</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onManageQuestions(assessment);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Layers size={13} className="text-muted-foreground shrink-0" />
              <span>Manage Questions</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onAssign(assessment);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Users size={13} className="text-emerald-600 shrink-0" />
              <span>Assign to Sections</span>
            </button>

            {assessment.status === "DRAFT" && onPublish && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onPublish(assessment);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <Send size={13} className="shrink-0" />
                <span>Publish Assessment</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewResults(assessment);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <BarChart3 size={13} className="text-primary shrink-0" />
              <span>Results & Analytics</span>
            </button>

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit(assessment);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Edit2 size={13} className="text-muted-foreground shrink-0" />
              <span>Edit Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete(assessment);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
            >
              <Trash2 size={13} className="shrink-0" />
              <span>Archive Assessment</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}


