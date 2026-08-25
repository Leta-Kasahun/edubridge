"use client";

import { useState, useRef } from "react";
import { MoreVertical, Eye, UserX, UserCheck } from "lucide-react";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { TeacherRecord } from "../types/teacher-provisioning.types";

export interface TeacherActionDropdownProps {
  readonly teacher: TeacherRecord;
  readonly onView: (teacher: TeacherRecord) => void;
  readonly onToggleStatus: (teacher: TeacherRecord) => void;
}

export function TeacherActionDropdown({
  teacher,
  onView,
  onToggleStatus,
}: TeacherActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden cursor-pointer"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 w-36 bg-card border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in-0 zoom-in-95">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onView(teacher);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            <Eye size={13} className="text-primary" />
            <span>Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onToggleStatus(teacher);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
          >
            {teacher.teacherStatus === "ACTIVE" ? (
              <>
                <UserX size={13} className="text-destructive" />
                <span className="text-destructive">Deactivate</span>
              </>
            ) : (
              <>
                <UserCheck size={13} className="text-primary" />
                <span className="text-primary font-medium">Activate</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
