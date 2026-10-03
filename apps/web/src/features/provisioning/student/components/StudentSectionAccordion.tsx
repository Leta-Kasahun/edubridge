"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MoreVertical, Eye, UserX, UserCheck, KeyRound } from "lucide-react";
import { formatStudentAccountStatus } from "@/shared/utils";
import { cn } from "@/lib/utils";
import {
  StudentRecord,
  AcademicStructureSection,
} from "../types/student-provisioning.types";

export interface StudentSectionAccordionProps {
  readonly section: AcademicStructureSection;
  readonly students: readonly StudentRecord[];
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly onViewDetails: (student: StudentRecord) => void;
  readonly onActivate: (student: StudentRecord) => void;
  readonly onDeactivate: (student: StudentRecord) => void;
  readonly onResetPassword?: (student: StudentRecord) => void;
}

function StudentRowActionDropdown({
  student,
  onViewDetails,
  onResetPassword,
  onActivate,
  onDeactivate,
}: {
  readonly student: StudentRecord;
  readonly onViewDetails: (student: StudentRecord) => void;
  readonly onResetPassword?: (student: StudentRecord) => void;
  readonly onActivate: (student: StudentRecord) => void;
  readonly onDeactivate: (student: StudentRecord) => void;
}) {
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
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        aria-label="Student options"
        aria-expanded={isOpen}
      >
        <MoreVertical size={15} />
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
                onViewDetails(student);
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
                onResetPassword?.(student);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
            >
              <KeyRound size={13} className="text-amber-500 shrink-0" />
              <span>Reset Password</span>
            </button>

            {student.status === "ACTIVE" ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDeactivate(student);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
              >
                <UserX size={13} className="text-destructive shrink-0" />
                <span className="text-destructive">Deactivate</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onActivate(student);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-primary hover:bg-muted rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap font-medium"
              >
                <UserCheck size={13} className="text-primary shrink-0" />
                <span className="text-primary font-medium">Activate</span>
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export function StudentSectionAccordion({
  section,
  students,
  isOpen,
  onToggle,
  onViewDetails,
  onActivate,
  onDeactivate,
  onResetPassword,
}: StudentSectionAccordionProps) {
  const sectionStudents = students.filter(
    (s) => s.enrollment?.sectionId === section.id
  );

  const displayCount = sectionStudents.length > 0 ? sectionStudents.length : section.studentCount;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xs transition-all">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-muted/40 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-foreground">
            {section.name}
          </span>
          <span className="text-xs text-muted-foreground">
            — {displayCount} {displayCount === 1 ? "student" : "students"}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border">
          {sectionStudents.length === 0 ? (
            <div className="px-6 py-8 text-center text-xs text-muted-foreground">
              No students enrolled in {section.name} yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-border/80 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20">
                    <th className="px-4 sm:px-6 py-3">Student</th>
                    <th className="px-4 py-3">Student code</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Account status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {sectionStudents.map((student) => {
                    const fullName = [
                      student.firstName,
                      student.middleName,
                      student.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ");

                    const formattedStatus = formatStudentAccountStatus(student.status);

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="px-4 sm:px-6 py-3.5 font-medium text-foreground">
                          {fullName}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-foreground font-semibold">
                          {student.studentCode}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-foreground">
                          {student.username}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground capitalize">
                          {student.gender.toLowerCase()}
                        </td>
                        <td className="px-4 py-3.5 text-foreground font-medium text-xs">
                          {formattedStatus}
                        </td>
                        <td className="px-4 py-3.5 text-right relative">
                          <StudentRowActionDropdown
                            student={student}
                            onViewDetails={onViewDetails}
                            onResetPassword={onResetPassword}
                            onActivate={onActivate}
                            onDeactivate={onDeactivate}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
