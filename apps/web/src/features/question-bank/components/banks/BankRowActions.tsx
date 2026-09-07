"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  Archive,
  Upload,
  Plus,
} from "lucide-react";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { QuestionBankItem, QuestionBankStatus } from "../../types/question-bank.types";

interface BankRowActionsProps {
  readonly bank: QuestionBankItem;
  readonly onEdit: (bank: QuestionBankItem) => void;
  readonly onUpload?: (bank: QuestionBankItem) => void;
  readonly onAddQuestion?: (bank: QuestionBankItem) => void;
  readonly onStatusChange: (id: string, status: QuestionBankStatus) => void;
  readonly onDelete: (id: string, name: string) => void;
  readonly isBusy: boolean;
}

export function BankRowActions({
  bank,
  onEdit,
  onUpload,
  onAddQuestion,
  onStatusChange,
  onDelete,
  isBusy,
}: BankRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 220;
      const menuWidth = 160;
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
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Actions"
      >
        {isBusy ? <LoadingSpinner size={14} /> : <MoreVertical size={15} />}
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
            className="w-40 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl py-1.5 animate-in fade-in-0 zoom-in-95 text-xs"
          >
            <Link
              href={`/dashboard/question-banks/${bank.id}`}
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
            >
              <Eye size={13} className="text-muted-foreground" />
              <span>View Questions</span>
            </Link>

            {onAddQuestion && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddQuestion(bank);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <Plus size={13} className="text-muted-foreground" />
                <span>Add Question</span>
              </button>
            )}

            {onUpload && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onUpload(bank);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <Upload size={13} className="text-muted-foreground" />
                <span>Upload Document</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit(bank);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
            >
              <Edit2 size={13} className="text-muted-foreground" />
              <span>Edit Bank</span>
            </button>

            {bank.status !== "ACTIVE" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onStatusChange(bank.id, "ACTIVE");
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <CheckCircle size={13} className="text-muted-foreground" />
                <span>Activate</span>
              </button>
            )}

            {bank.status === "ACTIVE" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onStatusChange(bank.id, "ARCHIVED");
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer text-foreground text-left"
              >
                <Archive size={13} className="text-muted-foreground" />
                <span>Archive</span>
              </button>
            )}

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete(bank.id, bank.name);
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
