"use client";

import { useState, useRef } from "react";
import { ChevronDown, MoreVertical, Eye, UserX, UserCheck } from "lucide-react";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
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
}

export function StudentSectionAccordion({
  section,
  students,
  isOpen,
  onToggle,
  onViewDetails,
  onActivate,
  onDeactivate,
}: StudentSectionAccordionProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(actionMenuRef, () => setActiveMenuId(null));

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
                    const isMenuOpen = activeMenuId === student.id;

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
                          <div className="inline-block text-left" ref={isMenuOpen ? actionMenuRef : undefined}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : student.id);
                              }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                              aria-label="Student options"
                            >
                              <MoreVertical size={15} />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-4 top-10 w-36 bg-card border border-border rounded-xl shadow-xl p-1 z-30 animate-in fade-in-0 zoom-in-95">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onViewDetails(student);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/70 rounded-lg transition-colors cursor-pointer text-left font-medium"
                                >
                                  <Eye size={13} className="text-muted-foreground" />
                                  <span>View details</span>
                                </button>

                                {student.status === "ACTIVE" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onDeactivate(student);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-left font-medium"
                                  >
                                    <UserX size={13} />
                                    <span>Deactivate</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onActivate(student);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer text-left font-medium"
                                  >
                                    <UserCheck size={13} />
                                    <span>Activate</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
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
