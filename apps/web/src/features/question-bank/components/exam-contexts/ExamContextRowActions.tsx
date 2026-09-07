"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ExamContextItem } from "../../types/question-bank.types";

interface ContextRowActionsProps {
  readonly context: ExamContextItem;
  readonly onEdit: (context: ExamContextItem) => void;
  readonly onDelete: (id: string, name: string) => void;
  readonly isDeleting: boolean;
}

export function ContextRowActions({
  context,
  onEdit,
  onDelete,
  isDeleting,
}: ContextRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 90;
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
        disabled={isDeleting}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Actions"
      >
        {isDeleting ? <LoadingSpinner size={14} /> : <MoreVertical size={15} />}
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
                onEdit(context);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
            >
              <Edit2 size={13} className="text-muted-foreground" />
              <span>Edit</span>
            </button>

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete(context.id, context.name);
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
