"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Target,
  CalendarDays,
  PlayCircle,
  HelpCircle,
  Award,
  Sparkles,
  Clock,
} from "lucide-react";
import { useMyStudentProfile } from "@/features/students/hooks/useStudentProfile";
import { useStudentClass } from "@/features/classes/hooks/useStudentClass";
import { useStudentMastery } from "@/features/mastery/hooks/useMastery";
import { useAssessments } from "../../hooks/useAssessments";
import { ASSESSMENT_TYPE_LABELS } from "@/shared/constants/assessment.constants";
import { ROUTES } from "@/constants/routes";
import { formatMinutes } from "@/shared/utils/assessment.util";

type MasteryStage = "Mastered" | "Doing Well" | "Needs Practice" | "Learning" | "Not Started";

interface SubjectMasteryItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly teacher: string;
  readonly progress: number;
  readonly stage: MasteryStage;
  readonly totalTopics: number;
  readonly masteredCount: number;
}

interface RecommendedTopicItem {
  readonly id: string;
  readonly subjectCode: string;
  readonly subjectName: string;
  readonly topicName: string;
  readonly stage: MasteryStage;
  readonly currentScore: number;
  readonly questionCount: number;
  readonly reason: string;
}

interface InProgressAssessmentItem {
  readonly id: string;
  readonly type: string;
  readonly subjectCode: string;
  readonly title: string;
  readonly timeLimitMinutes?: number | null;
  readonly totalQuestions: number;
}

interface RecentActivityItem {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly subjectCode: string;
  readonly date: string;
  readonly totalQuestions: number;
  readonly rawDate: number;
}

function getMasteryStage(pct: number | null | undefined): MasteryStage {
  if (pct === null || pct === undefined) return "Not Started";
  if (pct >= 80) return "Mastered";
  if (pct >= 65) return "Doing Well";
  if (pct >= 40) return "Needs Practice";
  if (pct > 0) return "Learning";
  return "Not Started";
}

function getMasteryColors(stage: MasteryStage) {
  switch (stage) {
    case "Mastered":
      return {
        bar: "bg-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
      };
    case "Doing Well":
      return {
        bar: "bg-primary",
        badge: "bg-primary/10 text-primary border-primary/20",
        text: "text-primary",
      };
    case "Needs Practice":
      return {
        bar: "bg-amber-500",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
      };
    case "Learning":
      return {
        bar: "bg-blue-500",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
      };
    default:
      return {
        bar: "bg-muted-foreground/30",
        badge: "bg-muted text-muted-foreground border-border",
        text: "text-muted-foreground",
      };
  }
}

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function StudentProgressView(): React.JSX.Element {
  const { data: profile, isLoading: isProfileLoading } = useMyStudentProfile();
  const { data: classData, isLoading: isClassLoading } = useStudentClass();
  
  const studentId = profile?.id ?? "";
  const { data: masteryData, isLoading: isMasteryLoading } = useStudentMastery(studentId);
  const { data: assessmentsResponse, isLoading: isAssessmentsLoading } = useAssessments({
    limit: 6,
  });

  const [selectedSubjectCode, setSelectedSubjectCode] = React.useState<string>("");

  const isLoading = isProfileLoading || isMasteryLoading || isClassLoading;

  const studentGradeLevel =
    profile?.enrollment?.gradeLevel ??
    classData?.section?.gradeLevel ??
    "10";

  // Deduplicated list of mastery subjects
  const uniqueSubjects = useMemo(() => {
    if (!masteryData?.subjects) return [];
    const seen = new Set<string>();
    return masteryData.subjects.filter((s) => {
      const key = s.subjectCode.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [masteryData?.subjects]);

  // Dynamic Subject Mastery from real database mastery + enrolled class metadata
  const subjectMasteryList: readonly SubjectMasteryItem[] = useMemo(() => {
    const subjectTeachers = classData?.subjectTeachers ?? [];
    const seenCodes = new Set<string>();
    const mapped: SubjectMasteryItem[] = [];

    for (const s of uniqueSubjects) {
      const codeKey = s.subjectCode.toLowerCase();
      if (seenCodes.has(codeKey)) continue;
      seenCodes.add(codeKey);

      const teacherMatch = subjectTeachers.find(
        (st) => st.subjectCode.toLowerCase() === codeKey
      );
      const progress = s.overallAccuracy !== null ? Math.round(s.overallAccuracy) : 0;
      const stage =
        s.overallAccuracy !== null
          ? getMasteryStage(progress)
          : s.totalTopics > 0 && s.masteredCount > 0
          ? "Learning"
          : "Not Started";

      mapped.push({
        id: s.subjectId || s.subjectCode,
        code: s.subjectCode,
        name: s.subjectName,
        teacher: teacherMatch?.teacherFullName ?? "Assigned Teacher",
        progress,
        stage,
        totalTopics: s.totalTopics,
        masteredCount: s.masteredCount,
      });
    }

    // Merge in any class subjects not yet present in student mastery data
    for (const st of subjectTeachers) {
      const codeKey = st.subjectCode.toLowerCase();
      if (!seenCodes.has(codeKey)) {
        seenCodes.add(codeKey);
        mapped.push({
          id: st.subjectCode,
          code: st.subjectCode,
          name: st.subjectName,
          teacher: st.teacherFullName,
          progress: 0,
          stage: "Not Started",
          totalTopics: 0,
          masteredCount: 0,
        });
      }
    }

    return mapped;
  }, [uniqueSubjects, classData]);

  // Adaptive Recommended Topics derived from lowest accuracy / developing topics
  const recommendedTopics: readonly RecommendedTopicItem[] = useMemo(() => {
    if (uniqueSubjects.length === 0) {
      return [];
    }

    const allTopics: Array<{
      id: string;
      subjectCode: string;
      subjectName: string;
      topicName: string;
      stage: MasteryStage;
      currentScore: number;
      questionCount: number;
      reason: string;
    }> = [];

    for (const s of uniqueSubjects) {
      for (const u of s.units) {
        for (const t of u.topics) {
          const score = t.accuracy !== null ? Math.round(t.accuracy) : 0;
          const stage =
            t.accuracy !== null
              ? getMasteryStage(score)
              : t.level === "DEVELOPING"
              ? "Needs Practice"
              : "Not Started";

          let reason = "Practice recommended to build foundation";
          if (t.accuracy !== null && t.accuracy < 50) {
            reason = `Low accuracy (${score}%) in ${t.questionCount} question${
              t.questionCount === 1 ? "" : "s"
            }`;
          } else if (t.accuracy !== null && t.accuracy < 70) {
            reason = `Developing mastery (${score}%) · Needs practice`;
          } else if (t.questionCount > 0) {
            reason = `Review recommended · ${t.questionCount} questions attempted`;
          }

          allTopics.push({
            id: t.topicId,
            subjectCode: s.subjectCode,
            subjectName: s.subjectName,
            topicName: t.topicTitle,
            stage,
            currentScore: score,
            questionCount: t.questionCount,
            reason,
          });
        }
      }
    }

    // Filter topics that need improvement first
    const needsImprovement = allTopics.filter(
      (t) => t.stage === "Needs Practice" || t.stage === "Learning" || (t.questionCount > 0 && t.currentScore < 75)
    );

    const candidatePool =
      needsImprovement.length > 0
        ? needsImprovement
        : allTopics.filter((t) => t.stage !== "Mastered");

    return candidatePool
      .sort((a, b) => {
        // Prioritize topics that were attempted with low score
        if (a.questionCount > 0 && b.questionCount === 0) return -1;
        if (b.questionCount > 0 && a.questionCount === 0) return 1;
        return a.currentScore - b.currentScore;
      })
      .slice(0, 6);
  }, [uniqueSubjects]);

  // Active / Published In-Progress Assessment items
  const inProgressAssessments: readonly InProgressAssessmentItem[] = useMemo(() => {
    const items = assessmentsResponse?.items ?? [];
    return items.slice(0, 3).map((assessment) => {
      const questionCount =
        assessment._count?.questions || assessment.questions?.length || 0;
      const typeLabel =
        ASSESSMENT_TYPE_LABELS[assessment.type] || assessment.type;

      return {
        id: assessment.id,
        type: typeLabel,
        subjectCode: assessment.examContext?.code || "EXAM",
        title: assessment.title,
        timeLimitMinutes: assessment.timeLimitMinutes,
        totalQuestions: questionCount,
      };
    });
  }, [assessmentsResponse]);

  // Recent Completed Activity derived from recorded topic practice and assessment evidence
  const recentActivities: readonly RecentActivityItem[] = useMemo(() => {
    if (uniqueSubjects.length === 0) return [];

    const activities: RecentActivityItem[] = [];

    for (const s of uniqueSubjects) {
      for (const u of s.units) {
        for (const t of u.topics) {
          if (t.questionCount > 0) {
            const dateMs = t.lastObservedAt
              ? new Date(t.lastObservedAt).getTime()
              : 0;
            activities.push({
              id: t.topicId,
              type: "Topic Practice",
              title: `${t.topicTitle} — ${u.unitTitle}`,
              subjectCode: s.subjectCode,
              date: formatRelativeTime(t.lastObservedAt),
              totalQuestions: t.questionCount,
              rawDate: dateMs,
            });
          }
        }
      }
    }

    return activities.sort((a, b) => b.rawDate - a.rawDate).slice(0, 4);
  }, [uniqueSubjects]);

  // High-level aggregate metrics
  const totalMasteredTopics = useMemo(() => {
    return uniqueSubjects.reduce((sum, s) => sum + s.masteredCount, 0);
  }, [uniqueSubjects]);

  const totalCurriculumTopics = useMemo(() => {
    return uniqueSubjects.reduce((sum, s) => sum + s.totalTopics, 0);
  }, [uniqueSubjects]);

  const averageAccuracy = useMemo(() => {
    if (uniqueSubjects.length === 0) return null;
    const subjectsWithScore = uniqueSubjects.filter(
      (s) => s.overallAccuracy !== null
    );
    if (subjectsWithScore.length === 0) return null;
    const totalAcc = subjectsWithScore.reduce(
      (sum, s) => sum + (s.overallAccuracy ?? 0),
      0
    );
    return Math.round(totalAcc / subjectsWithScore.length);
  }, [uniqueSubjects]);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full min-w-0">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="h-8 w-44 rounded-xl bg-muted/50 animate-pulse border border-border/40" />
          <div className="h-6 w-20 rounded-full bg-muted/40 animate-pulse border border-border/40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-card border border-border/50 animate-pulse p-4"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-full min-w-0">
      {/* Page Header with Grade & Quick Mastery Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            My Progress
          </h1>
          {studentGradeLevel && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Grade {studentGradeLevel}
            </span>
          )}
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {totalCurriculumTopics > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card border border-border text-foreground font-semibold">
              <Award size={14} className="text-primary" />
              <span>
                {totalMasteredTopics} / {totalCurriculumTopics} Topics Mastered
              </span>
            </span>
          )}
          {averageAccuracy !== null && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold">
              <Sparkles size={14} />
              <span>{averageAccuracy}% Avg Accuracy</span>
            </span>
          )}
        </div>
      </div>

      {/* Section 1: In Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <PlayCircle size={18} className="text-primary" />
            <span>In Progress</span>
          </h2>
          <Link
            href={ROUTES.ASSESSMENTS.BASE}
            className="text-xs font-semibold text-primary hover:underline shrink-0"
          >
            All exams
          </Link>
        </div>

        {inProgressAssessments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center flex flex-col items-center justify-center shadow-xs">
            <PlayCircle className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <h3 className="text-sm font-semibold text-foreground">
              No active exams right now
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
              All assigned exams are completed or not yet scheduled.
            </p>
            <Link
              href={ROUTES.ASSESSMENTS.BASE}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
            >
              <span>Explore Practice Tests</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressAssessments.map((item, idx) => (
              <div
                key={`in-prog-${item.id}-${idx}`}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between space-y-3 min-w-0 group"
              >
                <div className="space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {item.subjectCode}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {item.type}
                      </span>
                    </div>
                    {item.timeLimitMinutes ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <Clock size={12} />
                        <span>{formatMinutes(item.timeLimitMinutes)}</span>
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HelpCircle size={13} className="text-primary/70" />
                    <span>{item.totalQuestions} questions</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-border/60 flex items-center justify-end">
                  <Link
                    href={ROUTES.ASSESSMENTS.ATTEMPT(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-xs"
                  >
                    <span>Start Exam</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Recommended Topics to Improve */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Target size={18} className="text-primary" />
            <span>Recommended Topics to Practice</span>
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {recommendedTopics.length} recommended
          </span>
        </div>

        {recommendedTopics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center flex flex-col items-center justify-center shadow-xs">
            <Target className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <h3 className="text-sm font-semibold text-foreground">
              Great job! All topics are in good standing
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
              Keep practicing other curriculum subjects to maintain proficiency.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedTopics.map((item, idx) => {
              const colors = getMasteryColors(item.stage);

              return (
                <div
                  key={`rec-topic-${item.id}-${idx}`}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between space-y-3 min-w-0 group"
                >
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {item.subjectCode}
                      </span>
                      <span className={`text-xs font-bold ${colors.text}`}>
                        {item.currentScore > 0 ? `${item.currentScore}%` : "Not Attempted"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {item.topicName}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {item.subjectName}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {item.reason}
                    </p>

                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${Math.max(item.currentScore, 4)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}
                    >
                      {item.stage}
                    </span>
                    <Link
                      href={ROUTES.ASSESSMENTS.BASE}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-xs"
                    >
                      <span>Practice</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Subject Mastery Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <span>Subject Mastery</span>
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {subjectMasteryList.length} subjects
          </span>
        </div>

        {subjectMasteryList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center flex flex-col items-center justify-center shadow-xs">
            <BookOpen className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <h3 className="text-sm font-semibold text-foreground">
              No subjects registered
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Contact your school administrator to confirm your class enrollment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectMasteryList.map((item, idx) => {
              const colors = getMasteryColors(item.stage);

              return (
                <div
                  key={`subj-mastery-${item.id || item.code}-${idx}`}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between space-y-3 min-w-0 group"
                >
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {item.code}
                      </span>
                      <span className={`text-xs font-bold ${colors.text}`}>
                        {item.progress > 0 ? `${item.progress}%` : "0%"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.teacher}
                      </p>
                    </div>

                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${Math.max(item.progress, 3)}%` }}
                      />
                    </div>

                    {item.totalTopics > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        {item.masteredCount} of {item.totalTopics} topics mastered
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}
                    >
                      {item.stage}
                    </span>
                    <Link
                      href={ROUTES.ASSESSMENTS.BASE}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Practice</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 4: Curriculum Units & Topic Mastery Breakdown */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <span>Units & Topics Breakdown</span>
            </h2>
          </div>

          {/* Subject Switcher Tabs */}
          {uniqueSubjects.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 rounded-2xl border border-border">
              {uniqueSubjects.map((s, idx) => {
                const isSelected = (selectedSubjectCode || uniqueSubjects[0]?.subjectCode) === s.subjectCode;
                return (
                  <button
                    type="button"
                    key={`subj-tab-${s.subjectId || s.subjectCode}-${idx}`}
                    onClick={() => setSelectedSubjectCode(s.subjectCode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.subjectCode}
                    </span>
                    <span className="truncate max-w-[130px] sm:max-w-[180px]">{s.subjectName}</span>
                    {s.overallAccuracy !== null && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {Math.round(s.overallAccuracy)}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Subject Unit & Topic Breakdown */}
        {(() => {
          const activeSubject =
            uniqueSubjects.find(
              (s) => (selectedSubjectCode || uniqueSubjects[0]?.subjectCode) === s.subjectCode
            ) || uniqueSubjects[0];

          if (!activeSubject || activeSubject.units.length === 0) {
            return (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground">
                No units or topic structures registered yet for this subject.
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {activeSubject.units.map((unit, unitIdx) => {
                const masteredInUnit = unit.topics.filter(
                  (t) => t.level === "MASTERED" || (t.accuracy !== null && t.accuracy >= 80)
                ).length;
                const unitTopicCount = unit.topics.length;
                const unitProgress = unitTopicCount > 0 ? Math.round((masteredInUnit / unitTopicCount) * 100) : 0;

                return (
                  <div
                    key={`unit-${unit.unitId || unit.unitCode}-${unitIdx}`}
                    className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs space-y-3 p-4 sm:p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                            {unit.unitCode}
                          </span>
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {unit.unitTitle}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground font-medium">
                          {masteredInUnit}/{unitTopicCount} Topics Mastered
                        </span>
                        <div className="w-20 sm:w-28 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(unitProgress, 4)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {unit.topics.map((topic, topicIdx) => {
                        const score = topic.accuracy !== null ? Math.round(topic.accuracy) : 0;
                        const stage =
                          topic.accuracy !== null
                            ? getMasteryStage(score)
                            : topic.level === "DEVELOPING"
                            ? "Needs Practice"
                            : "Not Started";
                        const colors = getMasteryColors(stage);

                        return (
                          <div
                            key={`topic-${topic.topicId || topic.topicCode}-${topicIdx}`}
                            className="p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col justify-between space-y-2.5"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono font-medium text-muted-foreground truncate">
                                  {topic.topicCode}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}
                                >
                                  {stage}
                                </span>
                              </div>

                              <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug break-words">
                                {topic.topicTitle}
                              </h4>
                            </div>

                            <div className="space-y-1.5 pt-1 border-t border-border/50">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground">
                                  {topic.questionCount > 0
                                    ? `${topic.correctCount}/${topic.questionCount} correct`
                                    : "No attempts yet"}
                                </span>
                                <span className={`font-bold font-mono ${colors.text}`}>
                                  {topic.accuracy !== null ? `${score}%` : "—"}
                                </span>
                              </div>

                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${colors.bar}`}
                                  style={{ width: `${Math.max(score, 3)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Section 5: Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <CalendarDays size={18} className="text-primary" />
            <span>Recent Activity</span>
          </h2>
          <Link
            href={ROUTES.ASSESSMENTS.BASE}
            className="text-xs font-semibold text-primary hover:underline shrink-0"
          >
            All exams
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center flex flex-col items-center justify-center shadow-xs">
            <CalendarDays className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <h3 className="text-sm font-semibold text-foreground">
              No recent practice activity yet
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
              Complete your first topic practice test or exam to see your learning history here!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentActivities.map((item, idx) => (
              <div
                key={`activity-${item.id}-${idx}`}
                className="group rounded-2xl border border-border border-l-4 border-l-primary bg-card hover:bg-muted/20 transition-all p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-muted text-muted-foreground shrink-0">
                      {item.subjectCode}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 text-primary shrink-0">
                      {item.type}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={11} />
                      <span>{item.date}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen size={11} />
                      <span>{item.totalQuestions} questions answered</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                  <Link
                    href={ROUTES.ASSESSMENTS.BASE}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground text-xs font-semibold transition-all shadow-xs"
                  >
                    <RotateCcw size={12} />
                    <span>Practice Again</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
