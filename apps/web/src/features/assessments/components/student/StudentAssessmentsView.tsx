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
  Lock,
} from "lucide-react";
import { useAssessments } from "../../hooks/useAssessments";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { useAcademicYears } from "@/features/academic/academic-years/hooks/useAcademicYears";
import { useMyStudentProfile } from "@/features/students/hooks/useStudentProfile";
import { SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { SearchHighlight, SearchQueryProvider } from "@/shared/components/SearchHighlight";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { CardGridSkeleton } from "@/shared/components";
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
    return ASSESSMENT_TYPES.map((t: AssessmentType) => ({
      value: t,
      label: ASSESSMENT_TYPE_LABELS[t],
    }));
  }, []);

  const yearDropdownOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return academicYears.map((yr) => ({
      value: yr.id,
      label: yr.name || yr.code,
      badge: yr.status === "ACTIVE" ? "Current" : undefined,
    }));
  }, [academicYears]);

  const { data, isLoading, error } = useAssessments({
    academicYearId: selectedYearId !== "ALL" ? selectedYearId : undefined,
    type: selectedType !== "ALL" ? (selectedType as AssessmentType) : undefined,
  });

  const allAssessments = useMemo(() => {
    return (data?.items ?? []).filter(
      (a) => a.status === "PUBLISHED" || a.status === "ACTIVE"
    );
  }, [data]);

  const filterGroups: readonly FilterGroup[] = useMemo(
    () => [
      {
        id: "type",
        label: "Exam Type",
        options: typeDropdownOptions,
        selectedValue: selectedType,
        onSelect: setSelectedType,
      },
      {
        id: "year",
        label: "Academic Year",
        options: yearDropdownOptions,
        selectedValue: selectedYearId,
        onSelect: setSelectedYearId,
      },
    ],
    [typeDropdownOptions, selectedType, yearDropdownOptions, selectedYearId]
  );

  const filteredAssessments = useMemo(() => {
    return allAssessments.filter((item) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCode = (item.examContext?.code || "").toLowerCase().includes(query);
        const subject = subjectsList.find((s) => s.id === item.examContext?.id);
        const matchesSubject = subject ? subject.name.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesCode && !matchesSubject) {
          return false;
        }
      }
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
  }, [allAssessments, searchQuery, selectedSubjectId, subjectsList]);

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
        <CardGridSkeleton count={6} />
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
    <SearchQueryProvider query={searchQuery}>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                My Exams
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-none bg-primary/10 text-primary border border-primary/20">
                Grade {studentGradeLevel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Timed practice tests, topic exams, and national standardized papers.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-none border border-border p-3 sm:p-4 shadow-xs">
          <TableToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search exams by title or topic..."
            filters={filterGroups}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedSubjectId("ALL")}
            className={`inline-flex items-center gap-2 rounded-none px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedSubjectId === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            All Subjects
            <span
              className={`rounded-none px-1.5 py-0.5 text-[10px] ${
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
                className={`inline-flex items-center gap-2 rounded-none px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {sub.name}
                <span
                  className={`rounded-none px-1.5 py-0.5 text-[10px] ${
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
          <div className="rounded-none border border-dashed border-border p-12 text-center flex flex-col items-center justify-center bg-card shadow-xs">
            <div className="w-12 h-12 rounded-none bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
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

              const now = new Date();
              const isUpcoming = Boolean(
                assessment.availableFrom && new Date(assessment.availableFrom) > now
              );
              const isExpired = Boolean(
                assessment.availableUntil && new Date(assessment.availableUntil) < now
              );

              return (
                <div
                  key={assessment.id}
                  className="group relative flex flex-col justify-between rounded-none border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-none bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <FileCheck className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-none bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <Lock size={10} />
                            Upcoming
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            Closed
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-primary/10 text-primary border border-primary/20">
                          {typeLabel}
                        </span>
                        {assessment.examContext?.code && (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-none bg-muted text-muted-foreground border border-border">
                            <SearchHighlight text={assessment.examContext.code} />
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        <SearchHighlight text={assessment.title} />
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

                    {isUpcoming ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none bg-muted text-muted-foreground text-xs font-semibold">
                        <Lock size={12} />
                        <span>Opens Soon</span>
                      </span>
                    ) : isExpired ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none bg-muted text-muted-foreground text-xs font-semibold">
                        <span>Closed</span>
                      </span>
                    ) : (
                      <Link
                        href={ROUTES.ASSESSMENTS.ATTEMPT(assessment.id)}
                        className="inline-flex items-center gap-1.5 rounded-none bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 cursor-pointer shrink-0"
                      >
                        <span>Start Exam</span>
                        <ChevronRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SearchQueryProvider>
  );
}
