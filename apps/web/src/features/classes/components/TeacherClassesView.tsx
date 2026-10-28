"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  School,
  GraduationCap,
  Calendar,
  Eye,
  MoreVertical,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  LoadingSpinner,
  ErrorAlert,
  SearchHighlight,
  SearchQueryProvider,
  TableSkeleton,
} from "@/shared/components";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { getErrorMessage } from "@/shared/utils";
import { useSections } from "@/features/academic/sections/hooks/useSections";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { SectionDetailModal } from "@/features/academic/sections/components/SectionDetailModal";
import { SectionRecord, SectionFilterParams } from "@/features/academic/sections/types/section.types";
import { formatCapacityUtilization } from "@/shared/utils/section.util";
import { SECTION_STATUS_LABELS } from "@/shared/constants/section.constants";
import { useAuthStore } from "@/stores/auth.store";

interface ClassRowActionsProps {
  readonly section: SectionRecord;
  readonly onViewDetails: (section: SectionRecord) => void;
}

function ClassRowActions({ section, onViewDetails }: ClassRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = 80;
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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
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
        className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        aria-label="Actions"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && coords && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{ position: "fixed", top: `${coords.top}px`, left: `${coords.left}px`, zIndex: 9999 }}
          className="w-40 bg-popover text-popover-foreground border border-border rounded-none shadow-xl py-1.5 animate-in fade-in-0 zoom-in-95 text-xs"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onViewDetails(section);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-muted/80 transition-colors cursor-pointer text-left"
          >
            <Eye size={13} className="text-muted-foreground" />
            <span>View Details</span>
          </button>
          <Link
            href={`/dashboard/students?sectionId=${section.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-muted/80 transition-colors cursor-pointer text-left"
          >
            <Users size={13} className="text-muted-foreground" />
            <span>View Students</span>
          </Link>
        </div>,
        document.body
      )}
    </>
  );
}

export function TeacherClassesView() {
  const user = useAuthStore((s) => s.user);
  const [filters, setFilters] = useState<SectionFilterParams>({});
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "HOMEROOM" | "SUBJECT">("ALL");
  const [selectedSection, setSelectedSection] = useState<SectionRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: academicYearsResponse } = useAcademicYears();
  const academicYears = academicYearsResponse?.data || [];

  const { data: grades = [] } = useGrades({ isActive: true });

  const activeYear = useMemo(
    () =>
      academicYears.find((y) => y.status === "ACTIVE") ||
      academicYears[0],
    [academicYears]
  );

  const effectiveAcademicYearId = filters.academicYearId || activeYear?.id || "";

  const {
    data: sections = [],
    isLoading,
    error,
  } = useSections({
    gradeId: filters.gradeId,
    academicYearId: effectiveAcademicYearId || undefined,
  });

  const availableGrades = useMemo(() => {
    const gradeIdSet = new Set(sections.map((s) => s.gradeId));
    const gradeLevelSet = new Set(sections.map((s) => s.gradeLevel));
    return grades.filter((g) => gradeIdSet.has(g.id) || gradeLevelSet.has(g.level));
  }, [grades, sections]);

  const filteredSections = useMemo(() => {
    return sections.filter((sec) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = sec.name.toLowerCase().includes(q);
        const matchesHomeroom = (sec.homeroomTeacher?.fullName || "").toLowerCase().includes(q);
        const matchesCode = (sec.code || "").toLowerCase().includes(q);
        if (!matchesName && !matchesHomeroom && !matchesCode) {
          return false;
        }
      }
      if (roleFilter === "ALL") return true;
      const isHomeroom = Boolean(
        sec.homeroomTeacher &&
          (sec.homeroomTeacher.teacherId === user?.id ||
            sec.homeroomTeacher.id === user?.id)
      );
      return roleFilter === "HOMEROOM" ? isHomeroom : !isHomeroom;
    });
  }, [sections, search, roleFilter, user?.id]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const filterGroups: FilterGroup[] = [
    {
      id: "grade",
      label: "Grade",
      icon: GraduationCap,
      selectedValue: filters.gradeId || "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...availableGrades.map((g) => ({
          label: `Grade ${g.level}`,
          value: g.id,
        })),
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          gradeId: val === "ALL" ? undefined : val,
        }));
      },
    },
    {
      id: "role",
      label: "Role",
      icon: ShieldCheck,
      selectedValue: roleFilter,
      options: [
        { label: "All", value: "ALL" },
        { label: "Homeroom", value: "HOMEROOM" },
        { label: "Subject", value: "SUBJECT" },
      ],
      onSelect: (val) => {
        setRoleFilter(val as "ALL" | "HOMEROOM" | "SUBJECT");
      },
    },
    {
      id: "academicYear",
      label: "Academic Year",
      icon: Calendar,
      selectedValue: filters.academicYearId || "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...academicYears.map((y) => ({
          label: y.name.replace(/Academic Year/i, "").trim() || y.name,
          value: y.id,
        })),
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          academicYearId: val === "ALL" ? "" : val,
        }));
      },
    },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-none border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search classes..."
          filters={filterGroups}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} hasToolbar={false} />
      ) : error ? (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <ErrorAlert message={getErrorMessage(error, "Failed to load assigned classes.")} />
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="bg-card rounded-none border border-border min-h-[260px] flex flex-col items-center justify-center p-8 text-center shadow-xs">
          <div className="h-12 w-12 rounded-none bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <School size={22} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No classes found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {search || filters.gradeId || roleFilter !== "ALL"
              ? "No classes match your active filter criteria."
              : "You do not have any active class assignments yet."}
          </p>
        </div>
      ) : (
        <SearchQueryProvider query={search}>
          <div className="space-y-3">
            {/* Mobile responsive card list (< md and below 320px) */}
            <div className="md:hidden space-y-3">
              {filteredSections.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => {
                    setSelectedSection(sec);
                    setIsDetailModalOpen(true);
                  }}
                  className="bg-card rounded-none border border-border p-3.5 sm:p-4 shadow-xs space-y-3 transition-colors cursor-pointer hover:border-foreground/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        Section <SearchHighlight text={sec.name} />
                      </p>
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                        Grade {sec.gradeLevel}
                      </p>
                    </div>

                    <div
                      className="shrink-0 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ClassRowActions
                        section={sec}
                        onViewDetails={(s) => {
                          setSelectedSection(s);
                          setIsDetailModalOpen(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/60 text-xs text-center">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">
                        Homeroom
                      </span>
                      <p className="text-xs font-medium text-foreground truncate">
                        <SearchHighlight text={sec.homeroomTeacher?.fullName || "Unassigned"} />
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">
                        Students
                      </span>
                      <p className="text-xs font-medium text-foreground">
                        {sec.studentCount}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">
                        Status
                      </span>
                      <span className="font-medium text-foreground text-xs">
                        {SECTION_STATUS_LABELS[sec.status] || sec.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop structured table */}
            <div className="hidden md:block bg-card rounded-none border border-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Grade Level</th>
                      <th className="py-3 px-4">Homeroom Teacher</th>
                      <th className="py-3 px-4">Enrolled Students</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredSections.map((sec) => {
                      const isHomeroom = Boolean(
                        sec.homeroomTeacher &&
                          (sec.homeroomTeacher.teacherId === user?.id ||
                            sec.homeroomTeacher.id === user?.id)
                      );

                      return (
                        <tr
                          key={sec.id}
                          onClick={() => {
                            setSelectedSection(sec);
                            setIsDetailModalOpen(true);
                          }}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-foreground">
                              Section <SearchHighlight text={sec.name} />
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-foreground">
                            Grade {sec.gradeLevel}
                          </td>

                          <td className="py-3.5 px-4 text-foreground">
                            <SearchHighlight text={sec.homeroomTeacher ? sec.homeroomTeacher.fullName : "Unassigned"} />
                          </td>

                          <td className="py-3.5 px-4 text-foreground">
                            {formatCapacityUtilization(sec.studentCount, sec.capacity)}
                          </td>

                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {isHomeroom ? "Homeroom Teacher" : "Subject Teacher"}
                          </td>

                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {SECTION_STATUS_LABELS[sec.status] || sec.status}
                          </td>

                          <td
                            className="py-3.5 px-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <ClassRowActions
                                section={sec}
                                onViewDetails={(s) => {
                                  setSelectedSection(s);
                                  setIsDetailModalOpen(true);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SearchQueryProvider>
      )}

      {selectedSection && (
        <SectionDetailModal
          isOpen={isDetailModalOpen}
          sectionId={selectedSection.id}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedSection(null);
          }}
        />
      )}
    </div>
  );
}
