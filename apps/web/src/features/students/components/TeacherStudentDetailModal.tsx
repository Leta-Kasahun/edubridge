"use client";

import { X, User, GraduationCap, Users, MapPin, Loader2 } from "lucide-react";
import {
  formatDisplayDate,
  formatPhoneDisplay,
  formatStudentAccountStatus,
} from "@/shared/utils";
import { useStudentProfileById } from "../hooks/useStudentProfile";
import { StudentRosterItem } from "@/features/academic/assignments/student";

export interface TeacherStudentDetailModalProps {
  readonly student: StudentRosterItem | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function TeacherStudentDetailModal({
  student,
  isOpen,
  onClose,
}: TeacherStudentDetailModalProps) {
  const studentId = student?.studentId ?? "";
  const { data: profile, isLoading } = useStudentProfileById(
    studentId,
    Boolean(isOpen && studentId)
  );

  if (!isOpen || !student) return null;

  const fullName = profile?.fullName || student.fullName;
  const studentCode = profile?.studentCode || student.studentCode;
  const username = profile?.username;
  const gender = profile?.gender || student.gender;
  const status = profile?.enrollment?.status || student.status;
  const gradeLevel = profile?.enrollment?.gradeLevel ?? student.gradeLevel;
  const sectionName = profile?.enrollment?.sectionName ?? student.sectionName;
  const academicYearName = profile?.enrollment?.academicYearName ?? student.academicYearName;

  const formattedDateOfBirth = profile?.dateOfBirth
    ? formatDisplayDate(profile.dateOfBirth)
    : null;

  const formattedEnrolledDate = student.enrolledAt
    ? formatDisplayDate(student.enrolledAt)
    : null;

  const formattedAccountStatus = profile?.accountStatus
    ? formatStudentAccountStatus(profile.accountStatus)
    : profile?.status
      ? formatStudentAccountStatus(profile.status)
      : "Active";

  const primaryContact =
    profile?.contacts?.find((c) => c.isPrimary) || profile?.contacts?.[0];

  const address = profile?.address;
  const addressDetailsExist = Boolean(
    address?.regionName ||
      address?.zoneName ||
      address?.woredaName ||
      address?.cityName ||
      address?.kebeleName ||
      address?.specificLocation ||
      address?.formattedAddress
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl sm:max-w-2xl bg-card rounded-none border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              {fullName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
              <span className="font-mono font-semibold text-foreground">{studentCode}</span>
              <span>•</span>
              <span className="font-medium text-muted-foreground">Student</span>
              <span>•</span>
              <span className="font-medium text-muted-foreground">
                Grade {gradeLevel} — Section {sectionName}
              </span>
              {isLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Loader2 size={11} className="animate-spin" />
                  <span>Loading full profile...</span>
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Personal & Academic Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User size={14} className="text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Personal & Demographics
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Full Name
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {fullName}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Student Code
                </span>
                <span className="text-sm font-medium font-mono text-foreground mt-1 block">
                  {studentCode}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Gender
                </span>
                <span className="text-sm font-medium uppercase text-foreground mt-1 block">
                  {gender}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Assigned Username
                </span>
                <span className="text-sm font-bold font-mono text-foreground mt-1 block">
                  {username || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Date of Birth
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {formattedDateOfBirth || "Not registered"}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Age / Nationality
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {profile?.age ? `${profile.age} yrs` : "—"} · {profile?.nationality || "Ethiopian"}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Account Status
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {formattedAccountStatus}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Enrollment Status
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Enrollment Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap size={14} className="text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Academic Enrollment
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Class & Section
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  Section {sectionName}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Grade Level
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  Grade {gradeLevel}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Academic Year
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {academicYearName || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Enrolled Date
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {formattedEnrolledDate || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Parent / Guardian Contact */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Parent / Guardian Contact
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Parent / Guardian Name
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {primaryContact?.fullName || "Not registered"}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Relationship
                </span>
                <span className="text-sm font-medium capitalize text-foreground mt-1 block">
                  {primaryContact?.relationship
                    ? primaryContact.relationship.toLowerCase()
                    : "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Primary Phone
                </span>
                <span className="text-sm font-medium font-mono text-foreground mt-1 block">
                  {primaryContact?.phoneNumber
                    ? formatPhoneDisplay(primaryContact.phoneNumber)
                    : "Not registered"}
                </span>
              </div>

              <div className="p-3.5 rounded-none border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Alternative Phone
                </span>
                <span className="text-sm font-medium font-mono text-foreground mt-1 block">
                  {primaryContact?.alternativePhoneNumber
                    ? formatPhoneDisplay(primaryContact.alternativePhoneNumber)
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Residential Address Hierarchy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Residential Address
              </span>
            </div>
            {addressDetailsExist ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 rounded-none border border-border bg-background/50">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Region
                  </span>
                  <span className="text-sm font-medium text-foreground mt-1 block">
                    {address?.regionName || address?.regionId || "—"}
                  </span>
                </div>

                <div className="p-3.5 rounded-none border border-border bg-background/50">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Zone / Sub-City
                  </span>
                  <span className="text-sm font-medium text-foreground mt-1 block">
                    {address?.zoneName || address?.zoneId || "—"}
                  </span>
                </div>

                <div className="p-3.5 rounded-none border border-border bg-background/50">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Woreda
                  </span>
                  <span className="text-sm font-medium text-foreground mt-1 block">
                    {address?.woredaName || address?.woredaId || "—"}
                  </span>
                </div>

                <div className="p-3.5 rounded-none border border-border bg-background/50">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    City / Kebele
                  </span>
                  <span className="text-sm font-medium text-foreground mt-1 block">
                    {[
                      address?.cityName || address?.cityId,
                      address?.kebeleName || address?.kebeleId,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                </div>

                <div className="p-3.5 rounded-none border border-border bg-background/50 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Specific Location / Street
                  </span>
                  <span className="text-sm font-medium text-foreground mt-1 block">
                    {address?.specificLocation ||
                      address?.formattedAddress ||
                      "Not registered"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-none border border-border bg-background/50 text-xs text-muted-foreground">
                No residential address details registered yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 sm:px-6 py-3.5 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-none transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
