"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  HelpCircle,
  FileCheck,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useAssessments } from "../../hooks/useAssessments";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { useAcademicYears } from "@/features/academic/academic-years/hooks/useAcademicYears";
import { useMyStudentProfile } from "@/features/students/hooks/useStudentProfile";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  ASSESSMENT_TYPES,
  ASSESSMENT_TYPE_LABELS,
  AssessmentType,
} from "@/shared/constants/assessment.constants";
import { ROUTES } from "@/constants/routes";
import { formatMinutes } from "@/shared/utils/assessment.util";

export function StudentAssessmentsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedYearId, setSelectedYearId] = useState<string>("ALL");

  const { data: profile } = useMyStudentProfile();
  const { data: subjectsList = [] } = useSubjects();
  const { data: academicYearsResponse } = useAcademicYears();

  const academicYears = useMemo(() => {
    return academicYearsResponse?.data ?? [];
  }, [academicYearsResponse]);

  const studentGradeLevel = useMemo(() => {
    return profile?.enrollment?.gradeLevel ?? 8;
  }, [profile]);

  const typeDropdownOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return [
      { value: "ALL", label: "All Exam Types" },
      ...ASSESSMENT_TYPES.map((t: AssessmentType) => ({
        value: t,
        label: ASSESSMENT_TYPE_LABELS[t],
      })),
    ];
  }, []);

  const yearDropdownOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const baseOptions: SelectDropdownOption[] = [
      { value: "ALL", label: "All Academic Years" },
    ];
    const mapped = academicYears.map((yr) => ({
      value: yr.id,
      label: yr.name || yr.code,
      badge: yr.status === "ACTIVE" ? "Current" : undefined,
    }));
    return [...baseOptions, ...mapped];
  }, [academicYears]);

  const { data, isLoading, error } = useAssessments({
    academicYearId: selectedYearId !== "ALL" ? selectedYearId : undefined,
    type: selectedType !== "ALL" ? (selectedType as AssessmentType) : undefined,
    search: searchQuery.trim() || undefined,
  });

  const allAssessments = useMemo(() => {
    return data?.items ?? [];
  }, [data]);

  const filteredAssessments = useMemo(() => {
    return allAssessments.filter((item) => {
      if (selectedSubjectId !== "ALL") {
        const matchesSubject =
          item.examContext?.id === selectedSubjectId ||
          item.title.toLowerCase().includes(
            (subjectsList.find((s) => s.id === selectedSubjectId)?.name || "").toLowerCase()
          );
        if (!matchesSubject) return false;
      }
      return true;
    });
  }, [allAssessments, selectedSubjectId, subjectsList]);

  const subjects = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of allAssessments) {
      for (const subj of subjectsList) {
        if (
          item.examContext?.id === subj.id ||
          item.title.toLowerCase().includes(subj.name.toLowerCase())
        ) {
          counts.set(subj.id, (counts.get(subj.id) || 0) + 1);
        }
      }
    }

    return subjectsList
      .filter((s) => (counts.get(s.id) || 0) > 0)
      .map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        count: counts.get(s.id) || 0,
      }));
  }, [allAssessments, subjectsList]);

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
              className="h-48 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorAlert
        title="Unable to load exams"
        message="We could not load your exams at this time. Please try refreshing the page."
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
              My Exams
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Grade {studentGradeLevel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Timed practice tests, topic exams, and national standardized papers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-2 lg:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exams by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-3">
          <SelectDropdown
            value={selectedType}
            onChange={setSelectedType}
            options={typeDropdownOptions}
            placeholder="Filter Exam Type"
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

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedSubjectId("ALL")}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            selectedSubjectId === "ALL"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          All Subjects
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
              selectedSubjectId === "ALL"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {allAssessments.length}
          </span>
        </button>

        {subjects.map((sub) => {
          const isSelected = selectedSubjectId === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {sub.name}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {sub.count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredAssessments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center bg-card shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            No Exams Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            There are no active exams matching your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map((assessment) => {
            const questionCount =
              assessment._count?.questions || assessment.questions?.length || 0;
            const typeLabel =
              ASSESSMENT_TYPE_LABELS[assessment.type] || assessment.type;

            return (
              <div
                key={assessment.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <FileCheck className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {typeLabel}
                      </span>
                      {assessment.examContext?.code && (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                          {assessment.examContext.code}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {assessment.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <HelpCircle size={13} className="text-primary/70" />
                      {questionCount} {questionCount === 1 ? "Question" : "Questions"}
                    </span>
                    {assessment.timeLimitMinutes ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} className="text-amber-500/80" />
                        {formatMinutes(assessment.timeLimitMinutes)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {assessment.timeLimitMinutes ? "Timed Exam" : "Practice"}
                  </span>

                  <Link
                    href={ROUTES.ASSESSMENTS.ATTEMPT(assessment.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 cursor-pointer shrink-0"
                  >
                    <span>Start Exam</span>
                    <ChevronRight size={13} />
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
