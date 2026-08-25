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
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { TeacherActionDropdown } from "./TeacherActionDropdown";
import {
  useTeachers,
  useDeactivateTeacher,
  useActivateTeacher,
} from "../hooks/useTeacherProvisioning";
import {
  TeacherRecord,
  TeacherStatus,
  TeacherGender,
} from "../types/teacher-provisioning.types";

export interface TeacherListTableProps {
  readonly onAddTeacher: () => void;
  readonly onImportCsv: () => void;
  readonly onViewTeacher: (teacher: TeacherRecord) => void;
}

export function TeacherListTable({
  onAddTeacher,
  onImportCsv,
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
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full min-w-[850px] text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-5 py-3.5 min-w-[200px]">Teacher</th>
                    <th className="px-4 py-3.5 min-w-[130px]">Username</th>
                    <th className="px-4 py-3.5 min-w-[90px]">Gender</th>
                    <th className="px-4 py-3.5 min-w-[170px]">Email</th>
                    <th className="px-4 py-3.5 min-w-[130px]">Phone</th>
                    <th className="px-4 py-3.5 min-w-[90px]">Status</th>
                    <th className="px-4 py-3.5 min-w-[100px]">Verification</th>
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
                        {teacher.teacherStatus === "ACTIVE" ? "Active" : "Inactive"}
                      </td>

                      <td className="px-4 py-3.5 font-medium text-foreground text-xs whitespace-nowrap">
                        {teacher.emailVerified ? "Verified" : "Pending"}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <TeacherActionDropdown
                          teacher={teacher}
                          onView={onViewTeacher}
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
                        {teacher.teacherStatus === "ACTIVE" ? "Active" : "Inactive"}
                      </span>

                      <TeacherActionDropdown
                        teacher={teacher}
                        onView={onViewTeacher}
                        onToggleStatus={handleToggleStatus}
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
                    <div className="col-span-2 flex items-center justify-between pt-1 border-t border-border/60">
                      <span className="text-[10px] uppercase text-muted-foreground">Verification</span>
                      <span className="font-medium text-foreground text-xs">{teacher.emailVerified ? "Verified" : "Pending"}</span>
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
