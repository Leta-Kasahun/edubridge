"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  Archive,
  RotateCcw,
} from "lucide-react";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { QuestionListItem } from "../../types/question-bank.types";

export interface QuestionRowActionsProps {
  readonly question: QuestionListItem;
  readonly onPreview: (q: QuestionListItem) => void;
  readonly onEdit: (q: QuestionListItem) => void;
  readonly onPublish: (id: string) => void;
  readonly onArchive: (id: string) => void;
  readonly onActivate: (id: string) => void;
  readonly onDelete: (id: string, code: string) => void;
  readonly isBusy: boolean;
}

export function QuestionRowActions({
  question,
  onPreview,
  onEdit,
  onPublish,
  onArchive,
  onActivate,
  onDelete,
  isBusy,
}: QuestionRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 160;

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
        aria-label="Actions"
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
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onPreview(question);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Eye size={13} className="text-muted-foreground shrink-0" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit(question);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Edit2 size={13} className="text-muted-foreground shrink-0" />
              <span>Edit</span>
            </button>

            {question.status !== "PUBLISHED" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onPublish(question.id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <CheckCircle size={13} className="shrink-0" />
                <span>Publish</span>
              </button>
            )}

            {question.status === "PUBLISHED" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onArchive(question.id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <Archive size={13} className="shrink-0" />
                <span>Archive</span>
              </button>
            )}

            {question.status === "ARCHIVED" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onActivate(question.id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <RotateCcw size={13} className="shrink-0" />
                <span>Activate</span>
              </button>
            )}

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete(question.id, question.code);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
            >
              <Trash2 size={13} className="shrink-0" />
              <span>Delete</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}



