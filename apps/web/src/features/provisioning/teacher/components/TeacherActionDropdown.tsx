"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Eye, UserX, UserCheck, KeyRound } from "lucide-react";
import { TeacherRecord } from "../types/teacher-provisioning.types";

export interface TeacherActionDropdownProps {
  readonly teacher: TeacherRecord;
  readonly onView: (teacher: TeacherRecord) => void;
  readonly onToggleStatus: (teacher: TeacherRecord) => void;
  readonly onResetPassword?: (teacher: TeacherRecord) => void;
}

export function TeacherActionDropdown({
  teacher,
  onView,
  onToggleStatus,
  onResetPassword,
}: TeacherActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 168;
    const menuHeight = 120;

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
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden cursor-pointer"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            className="w-44 bg-card text-foreground border border-border rounded-xl shadow-xl p-1 animate-in fade-in-0 zoom-in-95 text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onView(teacher);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              <Eye size={13} className="text-muted-foreground shrink-0" />
              <span>View Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onResetPassword?.(teacher);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
            >
              <KeyRound size={13} className="text-amber-500 shrink-0" />
              <span>Reset Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onToggleStatus(teacher);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              {teacher.teacherStatus === "ACTIVE" ? (
                <>
                  <UserX size={13} className="text-destructive shrink-0" />
                  <span className="text-destructive">Deactivate</span>
                </>
              ) : (
                <>
                  <UserCheck size={13} className="text-primary shrink-0" />
                  <span className="text-primary font-medium">Activate</span>
                </>
              )}
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
