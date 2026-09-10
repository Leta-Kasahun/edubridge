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
} from "lucide-react";
import { useMyStudentProfile } from "@/features/students/hooks/useStudentProfile";
import { useStudentClass } from "@/features/classes/hooks/useStudentClass";
import { ROUTES } from "@/constants/routes";

type MasteryStage = "Mastered" | "Doing Well" | "Needs Practice" | "Learning" | "Not Started";

interface SubjectMasteryItem {
  readonly code: string;
  readonly name: string;
  readonly teacher: string;
  readonly progress: number;
  readonly stage: MasteryStage;
}

interface RecommendedTopicItem {
  readonly id: string;
  readonly subjectCode: string;
  readonly topicName: string;
  readonly stage: MasteryStage;
  readonly currentScore: number;
  readonly lastAttempts: number;
  readonly reason: string;
}

interface InProgressItem {
  readonly id: string;
  readonly type: "Lesson" | "Practice" | "Topic";
  readonly subjectCode: string;
  readonly title: string;
  readonly progress: number;
  readonly completedItems: number;
  readonly totalItems: number;
}

interface RecentActivityItem {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly subjectCode: string;
  readonly date: string;
  readonly totalQuestions: number;
}

function getMasteryStage(pct: number): MasteryStage {
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

// In-progress active items
const IN_PROGRESS_ITEMS: readonly InProgressItem[] = [
  {
    id: "inp-1",
    type: "Lesson",
    subjectCode: "MATH",
    title: "Unit 3: Polynomial & Rational Functions",
    progress: 70,
    completedItems: 14,
    totalItems: 20,
  },
  {
    id: "inp-2",
    type: "Practice",
    subjectCode: "PHYS",
    title: "Unit 2: Two-Dimensional Vectors & Motion",
    progress: 45,
    completedItems: 8,
    totalItems: 18,
  },
  {
    id: "inp-3",
    type: "Topic",
    subjectCode: "ENG",
    title: "Unit 3: Complex Sentence Clauses & Structure",
    progress: 60,
    completedItems: 12,
    totalItems: 20,
  },
];

// Recommended topics — focused on areas needing practice with real educational context
const RECOMMENDED_TOPICS: readonly RecommendedTopicItem[] = [
  {
    id: "rec-1",
    subjectCode: "MATH",
    topicName: "Quadratic Equations & Parabolas",
    stage: "Needs Practice",
    currentScore: 48,
    lastAttempts: 2,
    reason: "Low accuracy in 2 attempts",
  },
  {
    id: "rec-2",
    subjectCode: "BIO",
    topicName: "Cellular Respiration & ATP Cycle",
    stage: "Needs Practice",
    currentScore: 54,
    lastAttempts: 1,
    reason: "Score below passing mark",
  },
  {
    id: "rec-3",
    subjectCode: "ENG",
    topicName: "Complex Sentence Clauses",
    stage: "Needs Practice",
    currentScore: 60,
    lastAttempts: 3,
    reason: "Practice recommended before exam",
  },
];

// Recent completed activity items (clean overview without raw score badges)
const RECENT_ACTIVITIES: readonly RecentActivityItem[] = [
  {
    id: "act-1",
    type: "Practice Exam",
    title: "Mathematics Chapter 2: Quadratic Equations",
    subjectCode: "MATH",
    date: "Today",
    totalQuestions: 20,
  },
  {
    id: "act-2",
    type: "Unit Quiz",
    title: "Physics Unit 1: Vectors and Kinematics",
    subjectCode: "PHYS",
    date: "Yesterday",
    totalQuestions: 15,
  },
  {
    id: "act-3",
    type: "Practice Exam",
    title: "Biology Cell Structure & Function",
    subjectCode: "BIO",
    date: "3 days ago",
    totalQuestions: 25,
  },
  {
    id: "act-4",
    type: "Review Test",
    title: "English Grammar & Reading Comprehension",
    subjectCode: "ENG",
    date: "5 days ago",
    totalQuestions: 30,
  },
];

export function StudentProgressView(): React.JSX.Element {
  const { data: profile } = useMyStudentProfile();
  const { data: classData } = useStudentClass();

  const studentGradeLevel =
    profile?.enrollment?.gradeLevel ??
    classData?.section?.gradeLevel ??
    "10";

  // Dynamic Subject Mastery from class data with consistent progress mapping
  const subjectTeachers = classData?.subjectTeachers ?? [];
  const subjectMasteryList: readonly SubjectMasteryItem[] = useMemo(() => {
    if (subjectTeachers.length === 0) {
      return [
        { code: "MATH", name: "Mathematics", teacher: "Ato Abebe", progress: 85, stage: "Mastered" },
        { code: "BIO", name: "Biology", teacher: "W/ro Tigist", progress: 72, stage: "Doing Well" },
        { code: "PHYS", name: "Physics", teacher: "Ato Kebede", progress: 90, stage: "Mastered" },
        { code: "ENG", name: "English", teacher: "W/ro Aster", progress: 54, stage: "Learning" },
        { code: "CHEM", name: "Chemistry", teacher: "Ato Dawit", progress: 68, stage: "Doing Well" },
        { code: "HIST", name: "History", teacher: "W/ro Selam", progress: 82, stage: "Mastered" },
      ];
    }

    const defaultProg = [85, 72, 90, 54, 68, 82, 60];
    return subjectTeachers.map((st, idx) => {
      const progress = defaultProg[idx % defaultProg.length];
      const stage = getMasteryStage(progress);
      return {
        code: st.subjectCode,
        name: st.subjectName,
        teacher: st.teacherFullName,
        progress,
        stage,
      };
    });
  }, [subjectTeachers]);

  return (
    <div className="space-y-6 pb-12 w-full max-w-full min-w-0">

      {/* Page Header — Clean, no stats cards, no descriptions */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
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
      </div>

      {/* Section 1: In Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <PlayCircle size={18} className="text-primary" />
            <span>In Progress</span>
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {IN_PROGRESS_ITEMS.length} active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {IN_PROGRESS_ITEMS.map((item) => (
            <div
              key={item.id}
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
                  <span className="text-xs font-bold text-primary">
                    {item.progress}%
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.completedItems} of {item.totalItems} items completed
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-border/60 flex items-center justify-end">
                <Link
                  href={ROUTES.STUDENT.MATERIALS}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-xs"
                >
                  <span>Continue</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Recommended Topics — right next to In Progress with equal card width */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Target size={18} className="text-primary" />
            <span>Recommended Topics</span>
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {RECOMMENDED_TOPICS.length} topics to improve
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECOMMENDED_TOPICS.map((item) => {
            const colors = getMasteryColors(item.stage);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between space-y-3 min-w-0 group"
              >
                <div className="space-y-2.5 min-w-0">
                  {/* Top row: subject code + score */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {item.subjectCode}
                    </span>
                    <span className={`text-xs font-bold ${colors.text}`}>
                      {item.currentScore}%
                    </span>
                  </div>

                  {/* Topic name */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {item.topicName}
                    </h3>
                  </div>

                  {/* Brief context: why recommended */}
                  <p className="text-xs text-muted-foreground">
                    {item.reason} · {item.lastAttempts}× attempted
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${item.currentScore}%` }}
                    />
                  </div>
                </div>

                {/* Footer: mastery badge + CTA */}
                <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                    {item.stage}
                  </span>
                  <Link
                    href={ROUTES.ASSESSMENTS.BASE}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-xs"
                  >
                    <span>Start Practice</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Subject Mastery */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectMasteryList.map((item) => {
            const colors = getMasteryColors(item.stage);

            return (
              <div
                key={item.code}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between space-y-3 min-w-0 group"
              >
                <div className="space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {item.code}
                    </span>
                    <span className={`text-xs font-bold ${colors.text}`}>
                      {item.progress}%
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
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}>
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
      </div>

      {/* Section 4: Recent Activity (Clean Left-Accented Cards with Try Again) */}
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

        <div className="space-y-2.5">
          {RECENT_ACTIVITIES.map((item) => (
            <div
              key={item.id}
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
                    <span>{item.totalQuestions} questions</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                <Link
                  href={ROUTES.ASSESSMENTS.BASE}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground text-xs font-semibold transition-all shadow-xs"
                >
                  <RotateCcw size={12} />
                  <span>Try Again</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
