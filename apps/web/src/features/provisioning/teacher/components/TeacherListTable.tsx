"use client";

import { useState } from "react";
import {
  UserPlus,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { TeacherActionDropdown } from "./TeacherActionDropdown";
import {
  useTeachers,
  useDeactivateTeacher,
  useActivateTeacher,
} from "../hooks/useTeacherManagement";
import {
  TeacherRecord,
  TeacherStatus,
  TeacherGender,
} from "../types/teacher-provisioning.types";

export interface TeacherListTableProps {
  readonly onAddTeacher: () => void;
  readonly onImportCsv: () => void;
  readonly onEditTeacher: (teacher: TeacherRecord) => void;
  readonly onViewTeacher: (teacher: TeacherRecord) => void;
}

export function TeacherListTable({
  onAddTeacher,
  onImportCsv,
  onEditTeacher,
  onViewTeacher,
}: TeacherListTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TeacherStatus | undefined>(undefined);
  const [genderFilter, setGenderFilter] = useState<TeacherGender | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useTeachers({
    page,
    limit: 10,
    search: search.trim() || undefined,
    status: statusFilter,
    gender: genderFilter,
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

  const filterGroups: readonly FilterGroup[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "All Statuses", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
        { label: "Suspended", value: "SUSPENDED" },
      ],
      selectedValue: statusFilter || "",
      onSelect: (val) => {
        setStatusFilter((val as TeacherStatus) || undefined);
        setPage(1);
      },
      icon: Filter,
    },
    {
      id: "gender",
      label: "Gender",
      options: [
        { label: "All Genders", value: "" },
        { label: "Female", value: "FEMALE" },
        { label: "Male", value: "MALE" },
      ],
      selectedValue: genderFilter || "",
      onSelect: (val) => {
        setGenderFilter((val as TeacherGender) || undefined);
        setPage(1);
      },
    },
  ];

  const actionButtons = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onImportCsv}
        className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <UploadCloud size={15} />
        <span>Import CSV</span>
      </button>

      <button
        type="button"
        onClick={onAddTeacher}
        className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
      >
        <UserPlus size={15} />
        <span>Add Teacher</span>
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
          searchPlaceholder="Search by name, code, email, username..."
          filters={filterGroups}
          actionButton={actionButtons}
        />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xs pb-1">
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
              Get started by adding individual teachers or importing them via CSV.
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onAddTeacher}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
              >
                Add Teacher
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-visible">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Teacher</th>
                    <th className="px-4 py-3.5">Employee Code</th>
                    <th className="px-4 py-3.5">Username</th>
                    <th className="px-4 py-3.5">Gender</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teachers.map((teacher) => (
                    <tr
                      key={teacher.teacherProfileId}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {teacher.firstName} {teacher.middleName} {teacher.lastName}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {teacher.email || teacher.phoneNumber || "No contact info"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-muted-foreground">
                        {teacher.employeeCode}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-medium text-foreground">
                        {teacher.username}
                      </td>

                      <td className="px-4 py-3.5 uppercase text-muted-foreground">
                        {teacher.gender}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded text-[10px] font-semibold",
                            teacher.teacherStatus === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : teacher.teacherStatus === "SUSPENDED"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {teacher.teacherStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <TeacherActionDropdown
                          teacher={teacher}
                          onView={onViewTeacher}
                          onEdit={onEditTeacher}
                          onToggleStatus={handleToggleStatus}
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
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-foreground">
                          {teacher.firstName} {teacher.middleName} {teacher.lastName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {teacher.email || teacher.phoneNumber || "No contact info"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 rounded text-[10px] font-semibold",
                          teacher.teacherStatus === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {teacher.teacherStatus}
                      </span>
                      <TeacherActionDropdown
                        teacher={teacher}
                        onView={onViewTeacher}
                        onEdit={onEditTeacher}
                        onToggleStatus={handleToggleStatus}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-background/50 p-2.5 rounded-lg border border-border">
                    <div>
                      <span className="text-[10px] block uppercase text-muted-foreground">Username</span>
                      <span className="font-mono font-medium text-foreground">{teacher.username}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] block uppercase text-muted-foreground">Code</span>
                      <span className="font-mono">{teacher.employeeCode}</span>
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
