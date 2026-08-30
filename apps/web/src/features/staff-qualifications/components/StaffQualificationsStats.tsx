"use client";

import { Users, GraduationCap, Award, Briefcase } from "lucide-react";
import { StaffDirectoryItem } from "../types/staff-qualifications.types";

interface StaffQualificationsStatsProps {
  readonly items: readonly StaffDirectoryItem[];
  readonly total: number;
}

export function StaffQualificationsStats({
  items,
  total,
}: StaffQualificationsStatsProps) {
  const totalQualifications = items.reduce(
    (acc, t) => acc + t.qualifications.length,
    0
  );

  const certifiedStaffCount = items.filter((t) => t.certificateCount > 0).length;

  const totalExperienceRoles = items.reduce(
    (acc, t) => acc + t.experiences.length,
    0
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-muted text-foreground border border-border shrink-0">
            <Users size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-wider">
              Total Faculty
            </p>
            <p className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
              {total}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-muted text-foreground border border-border shrink-0">
            <GraduationCap size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-wider">
              Qualifications
            </p>
            <p className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
              {totalQualifications}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-muted text-foreground border border-border shrink-0">
            <Award size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-wider">
              Verified Docs
            </p>
            <p className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
              {certifiedStaffCount}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-muted text-foreground border border-border shrink-0">
            <Briefcase size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-wider">
              Experience Roles
            </p>
            <p className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
              {totalExperienceRoles}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
