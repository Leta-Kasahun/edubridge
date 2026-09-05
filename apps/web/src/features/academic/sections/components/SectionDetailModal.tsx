"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  GraduationCap,
  Calendar,
  UserCheck,
  Search,
  BookOpen,
} from "lucide-react";
import { useSectionDetail } from "../hooks/useSections";
import {
  formatCapacityUtilization,
  getCapacityPercentage,
  getCapacityBadgeClass,
} from "@/shared/utils/section.util";
import { LoadingSpinner } from "@/shared/components";

interface SectionDetailModalProps {
  readonly sectionId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function SectionDetailModal({
  sectionId,
  isOpen,
  onClose,
}: SectionDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "teachers">("students");

  const { data: section, isLoading } = useSectionDetail(sectionId);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const capacityPct = section
    ? getCapacityPercentage(section.studentCount, section.capacity)
    : null;

  const enrolledStudents = section?.enrolledStudents || [];
  const assignedTeachers = section?.assignedTeachers || [];

  const filteredStudents = enrolledStudents.filter((st) => {
    if (!studentSearch.trim()) return true;
    const query = studentSearch.toLowerCase();
    return (
      st.fullName.toLowerCase().includes(query) ||
      st.studentCode.toLowerCase().includes(query)
    );
  });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="min-w-0 pr-4">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              {section ? `Section ${section.name}` : "Section Details"}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              {section?.code} · Grade {section?.gradeLevel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-100px)] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size={22} />
            </div>
          ) : !section ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Section record could not be found.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                    <GraduationCap size={12} />
                    Grade Level
                  </span>
                  <p className="text-xs font-semibold text-foreground">
                    Grade {section.gradeLevel}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                    <Calendar size={12} />
                    Academic Session
                  </span>
                  <p className="text-xs font-semibold text-foreground truncate">
                    {section.academicYearName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-muted/20 border border-border text-center space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Active Students
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {section.studentCount}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/20 border border-border text-center space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Max Capacity
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {section.capacity || "Unlimited"}
                  </p>
                </div>
              </div>

              {section.capacity && (
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Capacity Utilization
                  </span>
                  <p className="text-xs font-semibold text-foreground">
                    {formatCapacityUtilization(section.studentCount, section.capacity)}
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Homeroom Teacher
                </span>
                {section.homeroomTeacher ? (
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="font-semibold text-foreground">
                      {section.homeroomTeacher.fullName}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {section.homeroomTeacher.employeeCode}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.5">
                    <UserCheck size={14} className="text-muted-foreground/60" />
                    <span>Unassigned</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("students")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        activeTab === "students"
                          ? "bg-muted text-foreground font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Students ({enrolledStudents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("teachers")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        activeTab === "teachers"
                          ? "bg-muted text-foreground font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Teachers ({assignedTeachers.length})
                    </button>
                  </div>

                  {activeTab === "students" && enrolledStudents.length > 5 && (
                    <div className="relative w-36">
                      <Search
                        size={12}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-6 pr-2 py-0.5 text-xs rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                      />
                    </div>
                  )}
                </div>

                {activeTab === "students" ? (
                  filteredStudents.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                      {filteredStudents.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {st.fullName}
                            </p>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {st.studentCode} · {st.gender}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {st.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-3 text-center">
                      {studentSearch
                        ? "No students match the search criteria."
                        : "No students currently enrolled in this section."}
                    </p>
                  )
                ) : assignedTeachers.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                    {assignedTeachers.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {t.fullName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {t.subjectName ? (
                              <span className="inline-flex items-center gap-1 text-primary">
                                <BookOpen size={10} />
                                {t.subjectName}
                              </span>
                            ) : (
                              t.role.replace(/_/g, " ")
                            )}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {t.employeeCode}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-3 text-center">
                    No subject teachers assigned to this section yet.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
