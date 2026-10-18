"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Calendar,
  School,
  User,
  Eye,
  MoreVertical,
  ArrowRightLeft,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner, ErrorAlert, SearchHighlight, SearchQueryProvider } from "@/shared/components";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { getErrorMessage, useInfiniteScrollSentinel } from "@/shared/utils";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useSections } from "@/features/academic/sections/hooks/useSections";
import { useGrades } from "@/features/academic/grades";
import {
  useInfiniteStudentRoster,
  StudentRosterItem,
  SingleTransferModal,
  PromotionModal,
} from "@/features/academic/assignments/student";
import { TeacherStudentDetailModal } from "./TeacherStudentDetailModal";

interface StudentRowActionsProps {
  readonly student: StudentRosterItem;
  readonly onViewDetails: (student: StudentRosterItem) => void;
  readonly onTransfer: (student: StudentRosterItem) => void;
}

function StudentRowActions({ student, onViewDetails, onTransfer }: StudentRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = 90;
    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(10, rect.top - menuHeight - 4);
    }
    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    setCoords({ top, left });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
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
        aria-label="Actions"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && coords && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{ position: "fixed", top: `${coords.top}px`, left: `${coords.left}px`, zIndex: 99999 }}
          className="w-40 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl py-1.5 animate-in fade-in-0 zoom-in-95 text-xs"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onViewDetails(student); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-muted/80 transition-colors cursor-pointer text-left"
          >
            <Eye size={13} className="text-muted-foreground" />
            <span>View Details</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onTransfer(student); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-muted/80 transition-colors cursor-pointer text-left"
          >
            <ArrowRightLeft size={13} className="text-muted-foreground" />
            <span>Transfer Section</span>
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

export function TeacherStudentsView() {
  const searchParams = useSearchParams();
  const initialSectionId = searchParams.get("sectionId") || undefined;

  const { data: academicYearsResponse } = useAcademicYears();
  const academicYears = academicYearsResponse?.data || [];

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");

  const activeYear = useMemo(
    () =>
      academicYears.find((y) => y.status === "ACTIVE") ||
      academicYears[0],
    [academicYears]
  );
  const effectiveAcademicYearId = selectedAcademicYearId || activeYear?.id || "";

  const { data: sections = [] } = useSections({
    academicYearId: effectiveAcademicYearId || undefined,
  });

  const { data: allGrades = [] } = useGrades({ isActive: true });

  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(
    initialSectionId
  );
  const [selectedGradeId, setSelectedGradeId] = useState<string | undefined>(undefined);
  const [genderFilter, setGenderFilter] = useState<"ALL" | "MALE" | "FEMALE">("ALL");
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null);
  const [transferStudent, setTransferStudent] = useState<StudentRosterItem | null>(null);
  const [isPromotionOpen, setIsPromotionOpen] = useState(false);

  useEffect(() => {
    if (initialSectionId) {
      setSelectedSectionId(initialSectionId);
    }
  }, [initialSectionId]);

  const availableGrades = useMemo(() => {
    const gradeIdSet = new Set(sections.map((s) => s.gradeId).filter(Boolean));
    const gradeLevelSet = new Set(sections.map((s) => s.gradeLevel));
    return allGrades
      .filter((g) => gradeIdSet.has(g.id) || gradeLevelSet.has(g.level))
      .sort((a, b) => a.level - b.level);
  }, [allGrades, sections]);

  const {
    data: rosterPages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteStudentRoster({
    academicYearId: effectiveAcademicYearId || undefined,
    sectionId: selectedSectionId,
    gradeId: selectedGradeId,
    search: debouncedSearch.trim() || undefined,
    limit: 30,
  });

  const rawStudents = useMemo(() => {
    if (!rosterPages) return [];
    return rosterPages.pages.flatMap((p) => [...p.items]);
  }, [rosterPages]);

  const students = useMemo(() => {
    let list = rawStudents;
    if (genderFilter !== "ALL") {
      list = list.filter((st) => st.gender === genderFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (st) =>
          st.fullName.toLowerCase().includes(q) ||
          st.studentCode.toLowerCase().includes(q) ||
          (st.sectionName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [rawStudents, genderFilter, search]);

  const gradeCountMap = useMemo(() => {
    const map = new Map<string, number>();
    rawStudents.forEach((st) => {
      map.set(st.gradeId, (map.get(st.gradeId) ?? 0) + 1);
    });
    return map;
  }, [rawStudents]);

  const lastPagination = rosterPages?.pages.at(-1)?.pagination;

  const sentinelRef = useInfiniteScrollSentinel(
    Boolean(hasNextPage),
    isFetchingNextPage,
    fetchNextPage
  );

  const filterGroups: FilterGroup[] = [
    {
      id: "academicYear",
      label: "Academic Year",
      icon: Calendar,
      selectedValue: selectedAcademicYearId || "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...academicYears.map((y) => ({
          label: y.name.replace(/Academic Year/i, "").trim() || y.name,
          value: y.id,
        })),
      ],
      onSelect: (val) => {
        setSelectedAcademicYearId(val === "ALL" ? "" : val);
      },
    },
    {
      id: "section",
      label: "Class",
      icon: School,
      selectedValue: selectedSectionId || "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...sections.map((s) => ({
          label: s.name,
          value: s.id,
        })),
      ],
      onSelect: (val) => {
        setSelectedSectionId(val === "ALL" ? undefined : val);
      },
    },
    {
      id: "gender",
      label: "Gender",
      icon: User,
      selectedValue: genderFilter,
      options: [
        { label: "All", value: "ALL" },
        { label: "Male", value: "MALE" },
        { label: "Female", value: "FEMALE" },
      ],
      onSelect: (val) => {
        setGenderFilter(val as "ALL" | "MALE" | "FEMALE");
      },
    },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-none border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
          }}
          searchPlaceholder="Search students..."
          filters={filterGroups}
          actionButton={
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsPromotionOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs whitespace-nowrap flex-1 sm:flex-initial"
              >
                <ArrowUpRight size={14} />
                <span>Run Promotion</span>
              </button>
            </div>
          }
        />
      </div>

      {availableGrades.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setSelectedGradeId(undefined);
            }}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 sm:px-4 rounded-none text-xs font-semibold transition-colors cursor-pointer shadow-xs",
              !selectedGradeId
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-muted/80"
            )}
          >
            <span>All Grades</span>
            <span
              className={cn(
                "text-[11px] font-mono",
                !selectedGradeId
                  ? "text-primary-foreground/90 font-bold"
                  : "text-muted-foreground"
              )}
            >
              {rawStudents.length}
            </span>
          </button>
          {availableGrades.map((g) => {
            const isSelected = selectedGradeId === g.id;
            const count = gradeCountMap.get(g.id) ?? 0;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setSelectedGradeId(g.id);
                }}
                className={cn(
                  "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 sm:px-4 rounded-none text-xs font-semibold transition-colors cursor-pointer shadow-xs",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-muted/80"
                )}
              >
                <span>Grade {g.level}</span>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    isSelected
                      ? "text-primary-foreground/90 font-bold"
                      : "text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {isLoading && !rosterPages ? (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-card border border-border">
          <LoadingSpinner size={32} />
        </div>
      ) : error ? (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <ErrorAlert message={getErrorMessage(error, "Failed to load student roster.")} />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-card rounded-none border border-border min-h-[260px] flex flex-col items-center justify-center p-8 text-center shadow-xs">
          <div className="h-12 w-12 rounded-none bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <GraduationCap size={22} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No students found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {search || selectedSectionId || selectedGradeId || genderFilter !== "ALL"
              ? "No students match your active filter criteria."
              : "No students are currently enrolled in your assigned classes."}
          </p>
        </div>
      ) : (
        <SearchQueryProvider query={search}>
          <div className="space-y-3">
            <div className="md:hidden space-y-3">
              {students.map((st) => (
                <div
                  key={st.enrollmentId}
                  onClick={() => setSelectedStudent(st)}
                  className="bg-card rounded-none border border-border p-3.5 sm:p-4 shadow-xs space-y-3 transition-colors cursor-pointer hover:border-foreground/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        <SearchHighlight text={st.fullName} />
                      </p>
                      {st.username && (
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                          <SearchHighlight text={`@${st.username}`} />
                        </p>
                      )}
                    </div>

                    <div
                      className="shrink-0 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StudentRowActions
                        student={st}
                        onViewDetails={setSelectedStudent}
                        onTransfer={setTransferStudent}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/60 text-xs text-center">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">Class</span>
                      <p className="text-xs font-medium text-foreground truncate">
                        <SearchHighlight text={`Section ${st.sectionName}`} />
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">Grade</span>
                      <p className="text-xs font-medium text-foreground">
                        Grade {st.gradeLevel}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">Status</span>
                      <span className="font-medium text-foreground text-xs">{st.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block bg-card rounded-none border border-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {students.map((st) => (
                      <tr
                        key={st.enrollmentId}
                        onClick={() => setSelectedStudent(st)}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground">
                            <SearchHighlight text={st.fullName} />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                          {st.username ? (
                            <SearchHighlight text={`@${st.username}`} />
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-foreground">
                          <SearchHighlight text={`Section ${st.sectionName}`} />
                        </td>

                        <td className="py-3.5 px-4 text-foreground">
                          {st.gender === "MALE" ? "Male" : "Female"}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {st.status}
                        </td>

                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <StudentRowActions
                              student={st}
                              onViewDetails={setSelectedStudent}
                              onTransfer={setTransferStudent}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SearchQueryProvider>
      )}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        )}
      </div>


      <TeacherStudentDetailModal
        student={selectedStudent}
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
      />

      <SingleTransferModal
        isOpen={Boolean(transferStudent)}
        onClose={() => setTransferStudent(null)}
        student={transferStudent}
        academicYearId={effectiveAcademicYearId}
      />

      <PromotionModal
        isOpen={isPromotionOpen}
        onClose={() => setIsPromotionOpen(false)}
        currentAcademicYearId={effectiveAcademicYearId}
        academicYears={academicYears}
        availableGrades={availableGrades.map((g) => g.level)}
      />
    </div>
  );
}
