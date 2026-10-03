"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  HelpCircle,
  FileQuestion,
  BookOpen,
} from "lucide-react";
import { useQuestionBanks } from "../../hooks/useQuestionBanks";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { useAcademicYears } from "@/features/academic/academic-years/hooks/useAcademicYears";
import { useMyStudentProfile } from "@/features/students/hooks/useStudentProfile";
import { QuestionBankItem, ExamScope } from "../../types/question-bank.types";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { ErrorAlert } from "@/shared/components/ErrorAlert";

const SCOPE_DROPDOWN_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "ALL", label: "All Scopes" },
  { value: "NATIONAL", label: "National Exams" },
  { value: "REGIONAL", label: "Regional Exams" },
  { value: "SCHOOL", label: "School Exams" },
  { value: "GENERAL", label: "General Practice" },
];

function formatCreatedDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function StudentQuestionBanksView(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ALL");
  const [selectedScope, setSelectedScope] = useState<string>("ALL");
  const [selectedYearId, setSelectedYearId] = useState<string>("ALL");

  const { data: profile } = useMyStudentProfile();
  const { data: subjectsList = [] } = useSubjects();
  const { data: gradesList = [] } = useGrades();
  const { data: academicYearsResponse } = useAcademicYears();

  const academicYears = useMemo(() => {
    return academicYearsResponse?.data ?? [];
  }, [academicYearsResponse]);

  const yearDropdownOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const baseOptions: SelectDropdownOption[] = [
      { value: "ALL", label: "All Academic Years" },
    ];
    const mapped = academicYears.map((yr) => ({
      value: yr.id,
      label: yr.name,
      badge: yr.status === "ACTIVE" ? "Current" : undefined,
    }));
    return [...baseOptions, ...mapped];
  }, [academicYears]);

  const studentGradeLevel = useMemo(() => {
    if (profile?.enrollment?.gradeLevel) {
      return profile.enrollment.gradeLevel;
    }
    const defaultGrade = gradesList.find((g) => g.level === 8);
    return defaultGrade?.level ?? 8;
  }, [profile, gradesList]);

  const { data, isLoading, isError, error } = useQuestionBanks({
    limit: 100,
    status: "ACTIVE",
  });

  const allBanks: readonly QuestionBankItem[] = useMemo(() => {
    return data?.items ?? [];
  }, [data]);

  const gradeRestrictedBanks = useMemo(() => {
    return allBanks.filter((bank) => {
      if (bank.grade?.level) {
        return bank.grade.level === studentGradeLevel;
      }
      if (bank.examContexts && bank.examContexts.length > 0) {
        return bank.examContexts.some(
          (ctx) => ctx.grade?.level === studentGradeLevel
        );
      }
      return true;
    });
  }, [allBanks, studentGradeLevel]);

  const filteredBanks = useMemo(() => {
    return gradeRestrictedBanks.filter((bank) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = bank.name.toLowerCase().includes(q);
        const matchSubject = bank.subject?.name.toLowerCase().includes(q);
        const matchCode = bank.code.toLowerCase().includes(q);
        const matchContext = bank.examContexts?.some((ctx) =>
          ctx.name.toLowerCase().includes(q)
        );
        if (!matchName && !matchSubject && !matchCode && !matchContext) {
          return false;
        }
      }

      if (selectedSubjectId !== "ALL") {
        const matchesSubject =
          bank.subjectId === selectedSubjectId ||
          bank.examContexts?.some((ctx) => ctx.subjectId === selectedSubjectId);
        if (!matchesSubject) {
          return false;
        }
      }

      if (selectedScope !== "ALL") {
        const matchesScope = bank.examContexts?.some(
          (ctx) => ctx.scope === (selectedScope as ExamScope)
        );
        if (!matchesScope) {
          return false;
        }
      }

      if (selectedYearId !== "ALL") {
        const selectedYearObj = academicYears.find((y) => y.id === selectedYearId);
        const yearNumber = selectedYearObj
          ? parseInt(selectedYearObj.code, 10) || parseInt(selectedYearObj.name, 10)
          : null;

        const matchesYear = bank.examContexts?.some((ctx) => {
          if (ctx.year && yearNumber && ctx.year === yearNumber) {
            return true;
          }
          if (selectedYearObj && ctx.name.includes(selectedYearObj.name)) {
            return true;
          }
          return false;
        });

        if (!matchesYear) {
          return false;
        }
      }

      return true;
    });
  }, [
    gradeRestrictedBanks,
    searchQuery,
    selectedSubjectId,
    selectedScope,
    selectedYearId,
    academicYears,
  ]);

  const subjects = useMemo(() => {
    const counts = new Map<string, number>();
    for (const bank of gradeRestrictedBanks) {
      if (bank.subjectId) {
        counts.set(bank.subjectId, (counts.get(bank.subjectId) || 0) + 1);
      }
      if (bank.examContexts) {
        for (const ctx of bank.examContexts) {
          if (ctx.subjectId) {
            counts.set(ctx.subjectId, (counts.get(ctx.subjectId) || 0) + 1);
          }
        }
      }
    }

    const available = subjectsList.filter((s) => (counts.get(s.id) || 0) > 0);
    return available.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      count: counts.get(s.id) || 0,
    }));
  }, [gradeRestrictedBanks, subjectsList]);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-8 rounded-xl bg-muted/50 animate-pulse border border-border/40 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-10 rounded-xl bg-muted/40 animate-pulse border border-border/40" />
          <div className="h-10 rounded-xl bg-muted/40 animate-pulse border border-border/40" />
          <div className="h-10 rounded-xl bg-muted/40 animate-pulse border border-border/40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorAlert
        title="Unable to load question banks"
        message={
          error instanceof Error
            ? error.message
            : "We could not load question banks at this time. Please try refreshing the page."
        }
        className="rounded-2xl"
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Question Banks
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Grade {studentGradeLevel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Browse question banks and practice curriculum exercises and exam questions by subject.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-2 lg:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by topic, keyword, or exam type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-3">
          <SelectDropdown
            value={selectedScope}
            onChange={setSelectedScope}
            options={SCOPE_DROPDOWN_OPTIONS}
            placeholder="Filter Scope"
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-3">
          <SelectDropdown
            value={selectedYearId}
            onChange={setSelectedYearId}
            options={yearDropdownOptions}
            placeholder="Filter Academic Year"
          />
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedSubjectId("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedSubjectId === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => {
            const isSelected = selectedSubjectId === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                }`}
              >
                <span>{sub.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {sub.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {filteredBanks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Question Banks Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            No question banks match your active search or filters. Try adjusting your subject, scope, or keyword filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanks.map((bank) => {
            const primaryContext = bank.examContexts?.[0];
            const authorName = bank.createdBy
              ? [bank.createdBy.firstName, bank.createdBy.lastName]
                  .filter(Boolean)
                  .join(" ")
              : null;
            const createdDate = formatCreatedDate(bank.createdAt);

            return (
              <div
                key={bank.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <FileQuestion className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {primaryContext?.scope && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/80">
                          {primaryContext.scope}
                        </span>
                      )}
                      {bank.subject?.code && (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/80">
                          {bank.subject.code}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {bank.name}
                    </h3>
                    {bank.subject?.name && (
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        {bank.subject.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-foreground">
                      {bank.questionCount || 0} questions
                    </span>
                    {(createdDate || authorName) && (
                      <span className="text-[10px] text-muted-foreground/75 truncate max-w-[140px] sm:max-w-[180px]">
                        {[createdDate, authorName ? `by ${authorName}` : null]
                          .filter(Boolean)
                          .join(" • ")}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/practice/${bank.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 cursor-pointer shrink-0"
                  >
                    <span>Start Practice</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
