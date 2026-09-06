"use client";

import React from "react";
import { GraduationCap, School, UserCheck, BookOpen } from "lucide-react";
import { useStudentClass } from "../hooks/useStudentClass";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

export const StudentClassView: React.FC = () => {
  const { data, isLoading, isError, error } = useStudentClass();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorAlert
        title="Unable to load class information"
        message={error instanceof Error ? error.message : "We could not load your class assignment details right now. Please try refreshing the page."}
        className="rounded-2xl"
      />
    );
  }

  const { section, homeroomTeacher, subjectTeachers } = data;

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] p-8 text-center bg-card border rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
          <School className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">No Active Class Assigned</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          You are currently not assigned to an active class section. Please contact your school administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">My Class</h1>
          <p className="text-sm text-muted-foreground">
            View your class details and your assigned teachers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 font-medium text-xs">
            {section.academicYearName}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 font-medium text-xs">
            Grade {section.gradeLevel} - {section.gradeName}
          </Badge>
        </div>
      </div>

      <Card className="rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card shadow-sm overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                {section.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">{section.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  Class Code: {section.code}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>{section.gradeName}</span>
                </div>
              </div>
            </div>

            {homeroomTeacher ? (
              <div className="flex items-center gap-3.5 bg-background/80 border p-4 rounded-xl shadow-xs">
                <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-xs">
                  {homeroomTeacher.photoUrl && (
                    <AvatarImage src={homeroomTeacher.photoUrl} alt={homeroomTeacher.fullName} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {getInitials(homeroomTeacher.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Homeroom Teacher</span>
                  </div>
                  <p className="font-medium text-sm text-foreground mt-0.5">
                    {homeroomTeacher.fullName}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground bg-muted/40 px-4 py-3 rounded-xl border border-dashed">
                No homeroom teacher assigned yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold tracking-tight">Subject Teachers</h2>
          <Badge variant="secondary" className="ml-1 text-xs">
            {subjectTeachers.length}
          </Badge>
        </div>

        {subjectTeachers.length === 0 ? (
          <div className="p-8 text-center bg-card border border-dashed rounded-2xl">
            <p className="text-sm text-muted-foreground">No subject teachers currently assigned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectTeachers.map((st) => (
              <Card
                key={`${st.subjectCode}-${st.teacherFullName}`}
                className="rounded-2xl border transition-all duration-200 hover:shadow-md hover:border-primary/30"
              >
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold truncate">
                      {st.subjectName}
                    </CardTitle>
                    <Badge variant="outline" className="text-[11px] shrink-0 font-normal">
                      {st.subjectCode}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0">
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <Avatar className="h-9 w-9 border border-border/60">
                      {st.photoUrl && <AvatarImage src={st.photoUrl} alt={st.teacherFullName} />}
                      <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                        {getInitials(st.teacherFullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium">Instructor</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {st.teacherFullName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
