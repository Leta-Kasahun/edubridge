"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  School,
  GraduationCap,
  Calendar,
  Eye,
  MoreVertical,
  ShieldCheck,
  Users,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { LoadingSpinner, ErrorAlert } from "@/shared/components";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { getErrorMessage } from "@/shared/utils";
import { SectionDetailModal } from "@/features/academic/sections/components/SectionDetailModal";
import { SectionRecord, SectionFilterParams } from "@/features/academic/sections/types/section.types";
import { formatCapacityUtilization } from "@/shared/utils/section.util";
import { SECTION_STATUS_LABELS } from "@/shared/constants/section.constants";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTeacherClasses, TeacherRoleFilter } from "../hooks/useTeacherClasses";

interface ClassActionsProps {
  readonly section: SectionRecord;
  readonly onViewDetails: (section: SectionRecord) => void;
}

function ClassActions({ section, onViewDetails }: ClassActionsProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Class actions"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-1">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(section);
          }}
          className="flex items-center gap-2 cursor-pointer text-xs"
        >
          <Eye size={14} className="text-muted-foreground" />
          <span>View Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/students?sectionId=${section.id}`);
          }}
          className="flex items-center gap-2 cursor-pointer text-xs"
        >
          <Users size={14} className="text-muted-foreground" />
          <span>View Students</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TeacherClassesView() {
  const [filters, setFilters] = useState<SectionFilterParams>({});
  const [roleFilter, setRoleFilter] = useState<TeacherRoleFilter>("ALL");
  const [selectedSection, setSelectedSection] = useState<SectionRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    sections,
    stats,
    academicYears,
    availableGrades,
    effectiveAcademicYearId,
    isLoading,
    error,
    isHomeroomSection,
  } = useTeacherClasses({ filters, roleFilter });

  const handleSearchChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      search: val || undefined,
    }));
  };

  const filterGroups: FilterGroup[] = [
    {
      id: "grade",
      label: "Grade",
      icon: GraduationCap,
      selectedValue: filters.gradeId || "ALL",
      options: [
        { label: "All Grades", value: "ALL" },
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
        { label: "All Roles", value: "ALL" },
        { label: "Homeroom", value: "HOMEROOM" },
        { label: "Subject", value: "SUBJECT" },
      ],
      onSelect: (val) => {
        setRoleFilter(val as TeacherRoleFilter);
      },
    },
    {
      id: "academicYear",
      label: "Year",
      icon: Calendar,
      selectedValue: effectiveAcademicYearId || "ALL",
      options: [
        { label: "All Years", value: "ALL" },
        ...academicYears.map((y) => ({
          label: y.name,
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

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <ErrorAlert message={getErrorMessage(error, "Failed to load assigned classes.")} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <School size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate">Total Classes</p>
            <p className="text-lg font-bold text-foreground">{stats.totalClasses}</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <UserCheck size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate">Homeroom</p>
            <p className="text-lg font-bold text-foreground">{stats.homeroomClasses}</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate">Subject</p>
            <p className="text-lg font-bold text-foreground">{stats.subjectClasses}</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate">Total Students</p>
            <p className="text-lg font-bold text-foreground">{stats.totalStudents}</p>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={filters.search || ""}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search classes by name or code..."
          filters={filterGroups}
        />
      </div>

      {/* Classes Content */}
      {sections.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border min-h-[260px] flex flex-col items-center justify-center p-8 text-center shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <School size={22} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No classes found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {filters.search || filters.gradeId || roleFilter !== "ALL"
              ? "No classes match your active filter criteria."
              : "You do not have any active class assignments yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile responsive card list */}
          <div className="md:hidden space-y-3">
            {sections.map((sec) => {
              const isHomeroom = isHomeroomSection(sec);
              return (
                <div
                  key={sec.id}
                  onClick={() => {
                    setSelectedSection(sec);
                    setIsDetailModalOpen(true);
                  }}
                  className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs space-y-3 transition-colors cursor-pointer hover:border-foreground/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground truncate">
                          Section {sec.name}
                        </p>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground">
                          {isHomeroom ? "Homeroom" : "Subject"}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                        Grade {sec.gradeLevel} &bull; {sec.academicYearName}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <ClassActions
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
                      <span className="text-[10px] text-muted-foreground block">Homeroom</span>
                      <p className="text-xs font-medium text-foreground truncate">
                        {sec.homeroomTeacher?.fullName || "Unassigned"}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">Students</span>
                      <p className="text-xs font-medium text-foreground">
                        {sec.studentCount} / {sec.capacity ?? "—"}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">Status</span>
                      <span className="font-medium text-foreground text-xs">
                        {SECTION_STATUS_LABELS[sec.status] || sec.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop structured table */}
          <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Grade Level</th>
                    <th className="py-3 px-4">Academic Year</th>
                    <th className="py-3 px-4">Homeroom Teacher</th>
                    <th className="py-3 px-4">Enrolled Students</th>
                    <th className="py-3 px-4">Your Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {sections.map((sec) => {
                    const isHomeroom = isHomeroomSection(sec);
                    return (
                      <tr
                        key={sec.id}
                        onClick={() => {
                          setSelectedSection(sec);
                          setIsDetailModalOpen(true);
                        }}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          Section {sec.name}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-foreground">
                          Grade {sec.gradeLevel}
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground">
                          {sec.academicYearName}
                        </td>

                        <td className="py-3.5 px-4 text-foreground">
                          {sec.homeroomTeacher ? sec.homeroomTeacher.fullName : "Unassigned"}
                        </td>

                        <td className="py-3.5 px-4 text-foreground">
                          {formatCapacityUtilization(sec.studentCount, sec.capacity)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                              isHomeroom
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isHomeroom ? "Homeroom Teacher" : "Subject Teacher"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {SECTION_STATUS_LABELS[sec.status] || sec.status}
                        </td>

                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ClassActions
                            section={sec}
                            onViewDetails={(s) => {
                              setSelectedSection(s);
                              setIsDetailModalOpen(true);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
