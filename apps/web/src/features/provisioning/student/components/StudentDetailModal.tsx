"use client";

import { X, User, GraduationCap, Users, MapPin, Loader2, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import {
  formatDisplayDate,
  formatPhoneDisplay,
  formatStudentAccountStatus,
} from "@/shared/utils";
import { StudentRecord } from "../types/student-provisioning.types";
import { useStudentProfileById } from "@/features/students/hooks/useStudentProfile";

export interface StudentDetailModalProps {
  readonly student: StudentRecord | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function StudentDetailModal({
  student,
  isOpen,
  onClose,
}: StudentDetailModalProps) {
  const profileId = student?.studentProfileId || student?.id || "";
  const { data: profile, isLoading } = useStudentProfileById(
    profileId,
    Boolean(isOpen && profileId)
  );

  if (!isOpen || !student) return null;

  const fullName = profile?.fullName || [
    profile?.firstName || student.firstName,
    profile?.middleName || student.middleName,
    profile?.lastName || student.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const studentCode = profile?.studentCode || student.studentCode;
  const username = profile?.username || student.username;
  const gender = profile?.gender || student.gender;
  const nationality = profile?.nationality || "Ethiopian";
  const formattedDob = profile?.dateOfBirth ? formatDisplayDate(profile.dateOfBirth) : null;
  const age = profile?.age;

  const formattedCreatedAt = student.createdAt
    ? formatDisplayDate(student.createdAt)
    : null;

  const formattedAccountStatus = formatStudentAccountStatus(profile?.accountStatus || student.status);

  const isProfileCompleted = Boolean(
    profile?.dateOfBirth &&
      profile?.address &&
      profile?.contacts &&
      profile.contacts.length > 0
  );

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

  const contacts = profile?.contacts || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl sm:max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 min-w-0">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={fullName}
                className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 shrink-0 text-sm">
                {fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                  {fullName}
                </h2>
                {isProfileCompleted ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={10} />
                    <span>Profile Completed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Clock size={10} />
                    <span>Setup Pending</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                <span className="font-mono font-semibold text-foreground">{studentCode}</span>
                <span>•</span>
                <span className="font-medium text-muted-foreground">Student</span>
                {isLoading && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Loader2 size={11} className="animate-spin" />
                    <span>Loading full profile...</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User size={14} className="text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Personal & Demographics
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Full Name
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {fullName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Gender
                </span>
                <span className="text-sm font-medium uppercase text-foreground mt-1 block">
                  {gender}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Date of Birth
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {formattedDob ? `${formattedDob} ${age ? `(${age} yrs)` : ""}` : "Not registered"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Nationality
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {nationality}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account & Credentials
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Assigned Username
                </span>
                <span className="text-sm font-bold font-mono text-foreground mt-1 block">
                  {username}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Student Code
                </span>
                <span className="text-sm font-medium font-mono text-foreground mt-1 block">
                  {studentCode}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Account Status
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {formattedAccountStatus}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Enrollment Status
                </span>
                <span className="text-sm font-medium text-foreground mt-1 block">
                  {student.enrollment?.status || student.studentStatus || "Active"}
                </span>
              </div>
            </div>
          </div>

          {(student.enrollment || profile?.enrollment) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap size={14} className="text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Academic Enrollment
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 rounded-xl border border-border bg-background/50">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Grade & Section
                  </span>
                  <span className="text-sm font-medium text-foreground mt-1 block">
                    Grade {student.enrollment?.gradeLevel || profile?.enrollment?.gradeLevel} — {student.enrollment?.sectionName || profile?.enrollment?.sectionName}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-background/50">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Role
                  </span>
                  <span className="text-sm font-medium text-foreground mt-1 block">
                    Student
                  </span>
                </div>
              </div>
            </div>
          )}

          {contacts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Parent & Guardian Contacts
                </span>
              </div>
              <div className="space-y-2.5">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-border bg-background/50 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        {c.isPrimary ? "Primary Contact" : c.isEmergencyContact ? "Emergency Contact" : "Contact"}
                      </span>
                      <span className="text-sm font-medium text-foreground mt-0.5 block">
                        {c.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Relationship
                      </span>
                      <span className="text-sm font-medium capitalize text-foreground mt-0.5 block">
                        {c.relationship.toLowerCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Phone Number
                      </span>
                      <span className="text-sm font-medium font-mono text-foreground mt-0.5 block">
                        {formatPhoneDisplay(c.phoneNumber) || "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {addressDetailsExist && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Residential Address
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {address?.regionName && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Region
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {address.regionName}
                    </span>
                  </div>
                )}
                {address?.zoneName && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Zone / Sub-City
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {address.zoneName}
                    </span>
                  </div>
                )}
                {address?.woredaName && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Woreda
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {address.woredaName}
                    </span>
                  </div>
                )}
                {address?.cityName && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      City
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {address.cityName}
                    </span>
                  </div>
                )}
                {address?.kebeleName && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Kebele
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {address.kebeleName}
                    </span>
                  </div>
                )}
                {address?.specificLocation && (
                  <div className="p-3.5 rounded-xl border border-border bg-background/50">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Specific Location
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1 block">
                      {address.specificLocation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {formattedCreatedAt && (
            <div className="p-3.5 rounded-xl border border-border bg-background/50">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Onboarded Date
              </span>
              <span className="text-sm font-medium text-foreground mt-1 block">
                {formattedCreatedAt}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-5 sm:px-6 py-3.5 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
