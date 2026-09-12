"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  School,
  BookOpen,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useStudentClass } from "../hooks/useStudentClass";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { getAvatarInitials } from "@/shared/utils";
import { ROUTES } from "@/constants/routes";

export const StudentClassView: React.FC = () => {
  const { data, isLoading, isError, error } = useStudentClass();

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorAlert
        title="Unable to load class information"
        message={
          error instanceof Error
            ? error.message
            : "We could not load your class assignment details right now. Please try refreshing the page."
        }
        className="rounded-2xl"
      />
    );
  }

  const { section, homeroomTeacher, subjectTeachers } = data;

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] p-8 text-center bg-card border border-border rounded-2xl shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
          <School className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          No Active Class Assigned
        </h2>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-md leading-relaxed">
          Your student account is currently not enrolled in an active class for this academic term. Please contact your school administrator or registrar office.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Grade Level: {section.gradeName} &bull; Class {section.name} &bull; {section.academicYearName}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={ROUTES.STUDENT.MATERIALS}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 cursor-pointer"
          >
            <span>Learning Materials</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {homeroomTeacher && (
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar className="h-12 w-12 border-2 border-primary/20 shrink-0">
              {homeroomTeacher.photoUrl && (
                <AvatarImage
                  src={homeroomTeacher.photoUrl}
                  alt={homeroomTeacher.fullName}
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {getAvatarInitials(homeroomTeacher.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary mb-0.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Homeroom Teacher</span>
              </div>
              <h2 className="font-bold text-sm sm:text-base text-foreground truncate">
                {homeroomTeacher.fullName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assigned class lead for Class {section.name}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Enrolled Subjects & Teachers
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border/60">
            {subjectTeachers.length} {subjectTeachers.length === 1 ? "Subject" : "Subjects"}
          </span>
        </div>

        {subjectTeachers.length === 0 ? (
          <div className="p-10 text-center bg-card border border-dashed border-border rounded-2xl">
            <p className="text-xs text-muted-foreground">
              No subject teachers currently assigned to this class.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectTeachers.map((st) => (
              <div
                key={`${st.subjectCode}-${st.teacherFullName}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">
                      {st.subjectCode}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {st.subjectName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Avatar className="h-8 w-8 border border-border/70 shrink-0">
                      {st.photoUrl && (
                        <AvatarImage src={st.photoUrl} alt={st.teacherFullName} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {getAvatarInitials(st.teacherFullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Teacher</p>
                      <p className="text-xs font-bold text-foreground truncate">
                        {st.teacherFullName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Course
                  </span>
                  <Link
                    href={ROUTES.STUDENT.MATERIALS}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 cursor-pointer"
                  >
                    <span>Study</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
