"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye } from "lucide-react";
import {
  StaffDirectoryItem,
  QUALIFICATION_LEVEL_LABELS,
} from "../types/staff-qualifications.types";
import { calculateTotalExperience } from "@/shared/utils/experience.util";
import { SearchHighlight } from "@/shared/components";

interface StaffQualificationsTableProps {
  readonly items: readonly StaffDirectoryItem[];
  readonly onViewDetails: (teacher: StaffDirectoryItem) => void;
}

function TeacherRowActions({
  teacher,
  onViewDetails,
}: {
  readonly teacher: StaffDirectoryItem;
  readonly onViewDetails: (teacher: StaffDirectoryItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
        aria-label="Actions"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-card border border-border shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onViewDetails(teacher);
            }}
            className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted/60 flex items-center gap-2 cursor-pointer"
          >
            <Eye size={13} className="text-muted-foreground" />
            <span>View Details</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function StaffQualificationsTable({
  items,
  onViewDetails,
}: StaffQualificationsTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-none border border-border p-8 text-center shadow-xs">
        <p className="text-xs text-muted-foreground">
          No qualified teachers found matching the current search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="md:hidden space-y-3">
        {items.map((teacher) => {
          const totalExpStr = calculateTotalExperience(teacher.experiences);
          const highestLevelStr = teacher.highestLevel
            ? QUALIFICATION_LEVEL_LABELS[teacher.highestLevel] || teacher.highestLevel
            : null;

          return (
            <div
              key={teacher.id}
              onClick={() => onViewDetails(teacher)}
              className="bg-card rounded-none border border-border p-4 shadow-xs hover:border-foreground/30 transition-colors space-y-3 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    <SearchHighlight text={teacher.fullName} />
                  </p>
                </div>

                <div
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TeacherRowActions
                    teacher={teacher}
                    onViewDetails={onViewDetails}
                  />
                </div>
              </div>

              {teacher.fieldsOfStudy.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap pt-1">
                  {teacher.fieldsOfStudy.map((field) => (
                    <span
                      key={field}
                      className="inline-flex px-2 py-0.5 rounded-none text-[10px] font-semibold bg-muted text-foreground border border-border"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Experience
                  </span>
                  <p className="text-[11px] font-semibold text-foreground truncate">
                    {teacher.latestPosition || "Faculty"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {totalExpStr} ({teacher.experiences.length}{" "}
                    {teacher.experiences.length === 1 ? "role" : "roles"})
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Qualifications
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {highestLevelStr && (
                      <span className="inline-flex px-1.5 py-0.2 rounded-none text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {highestLevelStr}
                      </span>
                    )}
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-none text-[9px] font-medium bg-muted text-muted-foreground border border-border">
                      {teacher.certificateCount > 0
                        ? `${teacher.certificateCount} Certs`
                        : "No cert"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-card rounded-none border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Teacher</th>
                <th className="py-3.5 px-4">Field of Study</th>
                <th className="py-3.5 px-4">Work Experience</th>
                <th className="py-3.5 px-4">Qualifications</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((teacher) => {
                const totalExpStr = calculateTotalExperience(teacher.experiences);
                const highestLevelStr = teacher.highestLevel
                  ? QUALIFICATION_LEVEL_LABELS[teacher.highestLevel] || teacher.highestLevel
                  : null;

                return (
                  <tr
                    key={teacher.id}
                    className="hover:bg-muted/20 transition-colors group cursor-pointer"
                    onClick={() => onViewDetails(teacher)}
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        <SearchHighlight text={teacher.fullName} />
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      {teacher.fieldsOfStudy.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {teacher.fieldsOfStudy.map((field) => (
                            <span
                              key={field}
                              className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-muted text-foreground border border-border"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-[11px]">
                          Not specified
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-medium text-foreground truncate">
                          {teacher.latestPosition || "Teaching Faculty"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {totalExpStr} · {teacher.experiences.length}{" "}
                          {teacher.experiences.length === 1 ? "role" : "roles"}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {highestLevelStr && (
                            <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                              {highestLevelStr}
                            </span>
                          )}
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                            {teacher.certificateCount > 0
                              ? `${teacher.certificateCount} Certs`
                              : "No cert"}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {teacher.qualifications.length}{" "}
                          {teacher.qualifications.length === 1 ? "degree" : "degrees"}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-foreground text-xs">
                        {teacher.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TeacherRowActions
                        teacher={teacher}
                        onViewDetails={onViewDetails}
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
  );
}
