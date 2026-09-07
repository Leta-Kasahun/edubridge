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

interface QuestionRowActionsProps {
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
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 180;
      const menuWidth = 140;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

      const top = openUpwards ? rect.top - menuHeight - 4 : rect.bottom + 4;
      const left = Math.max(8, rect.right - menuWidth);

      setCoords({ top, left });
    }
  };

  const handleToggle = () => {
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

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={isBusy}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Actions"
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
            className="w-36 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl py-1.5 animate-in fade-in-0 zoom-in-95 text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onPreview(question);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
            >
              <Eye size={13} className="text-muted-foreground" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit(question);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
            >
              <Edit2 size={13} className="text-muted-foreground" />
              <span>Edit</span>
            </button>

            {question.status !== "PUBLISHED" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onPublish(question.id);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <CheckCircle size={13} className="text-muted-foreground" />
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
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <Archive size={13} className="text-muted-foreground" />
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
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <RotateCcw size={13} className="text-muted-foreground" />
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
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors cursor-pointer text-left"
            >
              <Trash2 size={13} className="text-destructive" />
              <span>Delete</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
