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

interface AssessmentRowActionsProps {
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
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 240;
      const menuWidth = 170;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

      const top = openUpwards ? rect.top - menuHeight - 4 : rect.bottom + 4;
      const left = Math.max(8, rect.right - menuWidth);

      setCoords({ top, left });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const isPublishedOrActive =
    assessment.status === "PUBLISHED" || assessment.status === "ACTIVE";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={isBusy}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Assessment Actions"
        title="More Actions"
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
            className="w-44 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl py-1.5 animate-in fade-in-0 zoom-in-95 text-xs font-medium"
          >
            {isPublishedOrActive && (
              <Link
                href={ROUTES.ASSESSMENTS.ATTEMPT(assessment.id)}
                onClick={() => setIsOpen(false)}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <Play size={13} className="text-primary fill-primary/20" />
                <span>Launch / Preview</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onManageQuestions(assessment);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
            >
              <Layers size={13} className="text-muted-foreground" />
              <span>Manage Questions</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onAssign(assessment);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
            >
              <Users size={13} className="text-emerald-600" />
              <span>Assign to Sections</span>
            </button>

            {assessment.status === "DRAFT" && onPublish && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onPublish(assessment);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <Send size={13} className="text-blue-600" />
                <span>Publish Assessment</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewResults(assessment);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
            >
              <BarChart3 size={13} className="text-primary" />
              <span>Results & Analytics</span>
            </button>

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit(assessment);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
            >
              <Edit2 size={13} className="text-muted-foreground" />
              <span>Edit Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete(assessment);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors cursor-pointer text-left"
            >
              <Trash2 size={13} className="text-destructive" />
              <span>Archive Assessment</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
