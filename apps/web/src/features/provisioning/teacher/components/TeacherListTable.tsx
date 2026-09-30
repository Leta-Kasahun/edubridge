"use client";

import { useState } from "react";
import {
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ShieldCheck,
  Users,
} from "lucide-react";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { ACCOUNT_STATUS_FILTER_OPTIONS, formatStudentAccountStatus } from "@/shared/utils";
import { TeacherActionDropdown } from "./TeacherActionDropdown";
import {
  useTeachers,
  useDeactivateTeacher,
  useActivateTeacher,
} from "../hooks/useTeacherProvisioning";
import { useAcademicStructure } from "@/features/provisioning/student/hooks";
import { TeacherRecord } from "../types/teacher-provisioning.types";

export interface TeacherListTableProps {
  readonly onAddTeacher: () => void;
  readonly onImportCsv: () => void;
  readonly onViewTeacher: (teacher: TeacherRecord) => void;
  readonly onResetPassword?: (teacher: TeacherRecord) => void;
}

export function TeacherListTable({
  onAddTeacher,
  onImportCsv,
  onViewTeacher,
  onResetPassword,
}: TeacherListTableProps) {
  const [search, setSearch] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");
  const [accountStatus, setAccountStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const { data: structureData } = useAcademicStructure(
    selectedAcademicYearId || undefined
  );
  const academicYears = structureData?.academicYears || [];

  const { data: response, isLoading } = useTeachers({
    page,
    limit: 10,
    search: search.trim() || undefined,
    accountStatus: accountStatus !== "ALL" ? accountStatus : undefined,
    academicYearId: selectedAcademicYearId || undefined,
  });

  const deactivateMutation = useDeactivateTeacher();
  const activateMutation = useActivateTeacher();

  const teachers = response?.data || [];
  const pagination = response?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const handleToggleStatus = async (teacher: TeacherRecord) => {
    if (teacher.teacherStatus === "ACTIVE") {
      await deactivateMutation.mutateAsync({
        id: teacher.teacherProfileId,
        status: "INACTIVE",
      });
    } else {
      await activateMutation.mutateAsync(teacher.teacherProfileId);
    }
  };

  const filterGroups: FilterGroup[] = [];

  if (academicYears.length > 0) {
    filterGroups.push({
      id: "academicYear",
      label: "Academic year",
      options: [
        { label: "All", value: "" },
        ...academicYears.map((y) => ({
          label: y.name.replace(/Academic Year/i, "").trim() || y.name,
          value: y.id,
        })),
      ],
      selectedValue: selectedAcademicYearId,
      onSelect: (val) => {
        setSelectedAcademicYearId(val);
        setPage(1);
      },
      icon: Calendar,
    });
  }

  filterGroups.push({
    id: "accountStatus",
    label: "Status",
    options: ACCOUNT_STATUS_FILTER_OPTIONS.map((opt) => ({
      label: opt.label,
      value: opt.value,
    })),
    selectedValue: accountStatus,
    onSelect: (val) => {
      setAccountStatus(val);
      setPage(1);
    },
    icon: ShieldCheck,
  });

  const actionButtons = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onImportCsv}
        className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs shrink-0"
      >
        <Upload size={14} className="text-foreground" />
        <span>Import</span>
      </button>

      <button
        type="button"
        onClick={onAddTeacher}
        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
      >
        <Plus size={14} />
        <span>Teacher</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-4 w-full">
      <div className="bg-card p-4 rounded-2xl border border-border">
        <TableToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search by code, name, email, username..."
          filters={filterGroups}
          actionButton={actionButtons}
        />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-xs text-muted-foreground">Loading teachers...</div>
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-muted text-muted-foreground">
              <Users size={28} />
            </div>
            <div className="text-sm font-semibold text-foreground">No teachers found</div>
            <div className="text-xs text-muted-foreground max-w-sm mx-auto">
              Get started by adding individual teachers or importing them via Excel or CSV.
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onAddTeacher}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer shadow-xs hover:bg-primary/90 transition-colors"
              >
                <Plus size={13} />
                <span>Teacher</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full min-w-[800px] text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-5 py-3.5 min-w-[200px]">Teacher</th>
                    <th className="px-4 py-3.5 min-w-[130px]">Username</th>
                    <th className="px-4 py-3.5 min-w-[90px]">Gender</th>
                    <th className="px-4 py-3.5 min-w-[170px]">Email</th>
                    <th className="px-4 py-3.5 min-w-[130px]">Phone</th>
                    <th className="px-4 py-3.5 min-w-[110px]">Status</th>
                    <th className="px-4 py-3.5 text-right w-[70px] min-w-[70px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teachers.map((teacher) => (
                    <tr
                      key={teacher.teacherProfileId}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3.5 min-w-[200px]">
                        <div className="font-semibold text-foreground text-xs whitespace-nowrap">
                          {teacher.firstName} {teacher.middleName} {teacher.lastName}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {teacher.employeeCode}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-foreground text-xs whitespace-nowrap">
                        {teacher.username}
                      </td>

                      <td className="px-4 py-3.5 uppercase text-foreground text-xs">
                        {teacher.gender}
                      </td>

                      <td
                        className="px-4 py-3.5 text-foreground text-xs truncate max-w-[180px]"
                        title={teacher.email || ""}
                      >
                        {teacher.email || "—"}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-foreground text-xs whitespace-nowrap">
                        {teacher.phoneNumber || "—"}
                      </td>

                      <td className="px-4 py-3.5 font-medium text-foreground text-xs whitespace-nowrap">
                        {formatStudentAccountStatus(teacher.status)}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <TeacherActionDropdown
                          teacher={teacher}
                          onView={onViewTeacher}
                          onToggleStatus={handleToggleStatus}
                          onResetPassword={onResetPassword}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block sm:hidden divide-y divide-border">
              {teachers.map((teacher) => (
                <div key={teacher.teacherProfileId} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-foreground">
                        {teacher.firstName} {teacher.middleName} {teacher.lastName}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        {teacher.employeeCode}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {formatStudentAccountStatus(teacher.status)}
                      </span>

                      <TeacherActionDropdown
                        teacher={teacher}
                        onView={onViewTeacher}
                        onToggleStatus={handleToggleStatus}
                        onResetPassword={onResetPassword}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-background/50 p-2.5 rounded-lg border border-border">
                    <div>
                      <span className="text-[10px] block uppercase text-muted-foreground">Username</span>
                      <span className="font-mono font-medium text-foreground text-xs">{teacher.username}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block uppercase text-muted-foreground">Gender</span>
                      <span className="uppercase font-medium text-foreground text-xs">{teacher.gender}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block uppercase text-muted-foreground">Email</span>
                      <span className="font-medium text-foreground truncate block text-xs">{teacher.email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block uppercase text-muted-foreground">Phone</span>
                      <span className="font-mono font-medium text-foreground text-xs">{teacher.phoneNumber || "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-border text-xs text-muted-foreground bg-muted/20">
                <div>
                  Showing {teachers.length} of {pagination.total} teachers
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-background transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-background transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
