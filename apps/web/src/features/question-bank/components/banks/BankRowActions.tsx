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

export interface BankRowActionsProps {
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 184;
    const menuHeight = 200;

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
            <Link
              href={`/dashboard/question-banks/${bank.id}`}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Eye size={13} className="text-muted-foreground shrink-0" />
              <span>View Questions</span>
            </Link>

            {onAddQuestion && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddQuestion(bank);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
              >
                <Plus size={13} className="text-primary shrink-0" />
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
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
              >
                <Upload size={13} className="text-muted-foreground shrink-0" />
                <span>Upload Document</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit(bank);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Edit2 size={13} className="text-muted-foreground shrink-0" />
              <span>Edit</span>
            </button>

            {bank.status !== "ACTIVE" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onStatusChange(bank.id, "ACTIVE");
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <CheckCircle size={13} className="shrink-0" />
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
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <Archive size={13} className="shrink-0" />
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



