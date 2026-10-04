"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  TrendingUp,
  ChevronRight,
  PlayCircle,
  BookOpen,
} from "lucide-react";
import { useStudentClass } from "@/features/classes/hooks/useStudentClass";
import { useMyStudentProfile } from "@/features/students/hooks/useStudentProfile";
import { useStudentInProgressAssessments } from "@/features/assessments/hooks/useAssessments";
import { useStudentInProgressContent } from "@/features/learning-content/hooks/useLearningContent";
import { useStudentInProgressPractices } from "@/features/question-bank/hooks/useQuestionBanks";
import { getAllActiveSessions } from "@/features/question-bank/utils/practice-session.util";
import { useStudentMastery } from "@/features/mastery/hooks/useMastery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarInitials } from "@/shared/utils";
import { ROUTES } from "@/constants/routes";

function getEthiopianGreeting(): string {
  // Compute hour in East Africa Time (UTC+3 / Ethiopia)
  const now = new Date();
  const ethHours = (now.getUTCHours() + 3) % 24;

  if (ethHours >= 5 && ethHours < 12) {
    return "Good morning";
  }
  if (ethHours >= 12 && ethHours < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

type MasteryStage = "Mastered" | "Doing Well" | "Learning" | "Not Started";

interface SubjectProgressItem {
  readonly code: string;
  readonly name: string;
  readonly teacher: string;
  readonly progress: number;
  readonly status: MasteryStage;
}

interface InProgressActivityItem {
  readonly id: string;
  readonly type: "Practice Exam" | "Practice Test" | "Lesson" | "Topic";
  readonly subjectCode: string;
  readonly title: string;
  readonly progress: number;
  readonly completedItems: number;
  readonly totalItems: number;
  readonly href: string;
}

export function StudentDashboardOverview() {
  const { data: classData, isLoading: isClassLoading } = useStudentClass();
  const { data: profile, isLoading: isProfileLoading } = useMyStudentProfile();
  
  const studentId = profile?.id ?? "";
  const { data: masteryData, isLoading: isMasteryLoading } = useStudentMastery(studentId);
  const { data: inProgressAssessments = [], isLoading: isInProgressAssessmentsLoading } =
    useStudentInProgressAssessments();
  const { data: inProgressContent = [], isLoading: isInProgressContentLoading } =
    useStudentInProgressContent();
  const { data: inProgressPractices = [], isLoading: isInProgressPracticesLoading } =
    useStudentInProgressPractices();

  const isLoading =
    isClassLoading ||
    isProfileLoading ||
    isMasteryLoading ||
    isInProgressAssessmentsLoading ||
    isInProgressContentLoading ||
    isInProgressPracticesLoading;

  const section = classData?.section;
  const homeroomTeacher = classData?.homeroomTeacher;
  const subjectTeachers = useMemo(
    () => classData?.subjectTeachers ?? [],
    [classData?.subjectTeachers]
  );

  const studentName = profile?.firstName || profile?.fullName || "Student";
  const greeting = getEthiopianGreeting();

  // Dynamic Subtitle: Grade 8 • Section A • 2018 E.C.
  const gradeLabel =
    (profile?.enrollment?.gradeLevel ? `Grade ${profile.enrollment.gradeLevel}` : null) ||
    section?.gradeName ||
    "Grade 8";
  const sectionLabel = section?.name ? `Section ${section.name}` : "Section A";
  const academicYear =
    section?.academicYearName || profile?.enrollment?.academicYearName || "2018 E.C.";

  const identityLine = [gradeLabel, sectionLabel, academicYear].filter(Boolean).join(" • ");

  // Real In-Progress Activities strictly from PostgreSQL attempts, real content progress, and genuine practice sessions
  const inProgressActivities: readonly InProgressActivityItem[] = useMemo(() => {
    const list: InProgressActivityItem[] = [];

    // 1. Genuine in-progress assessment attempts from PostgreSQL
    for (const a of inProgressAssessments) {
      list.push({
        id: a.id,
        type: a.timeLimitMinutes ? "Practice Exam" : "Practice Test",
        subjectCode: a.subjectCode,
        title: a.title,
        progress: a.progressPercent,
        completedItems: a.answeredCount,
        totalItems: a.totalQuestions,
        href: ROUTES.ASSESSMENTS.ATTEMPT(a.assessmentId),
      });
    }

    // 2. Genuine in-progress learning content / videos from PostgreSQL
    for (const c of inProgressContent) {
      list.push({
        id: c.id,
        type: c.type === "VIDEO" ? "Lesson" : "Topic",
        subjectCode: c.subjectCode,
        title: c.title,
        progress: Math.round(c.progressPercent),
        completedItems: Math.round(c.progressPercent),
        totalItems: 100,
        href: `/learn/${c.contentId}`,
      });
    }

    // 3. Genuine question bank practice sessions (from PostgreSQL + local fallback)
    const seenBankIds = new Set<string>();
    for (const p of inProgressPractices) {
      seenBankIds.add(p.bankId);
      list.push({
        id: p.id,
        type: "Practice Test",
        subjectCode: p.subjectCode || p.bankId.slice(0, 4).toUpperCase(),
        title: p.bankName,
        progress: p.progressPercent,
        completedItems: p.answeredCount,
        totalItems: p.totalQuestions,
        href: `/dashboard/question-banks/${p.bankId}/practice`,
      });
    }

    const activePractice = getAllActiveSessions();
    for (const p of activePractice) {
      if (!seenBankIds.has(p.bankId) && p.answeredCount > 0 && p.answeredCount < p.totalQuestions) {
        list.push({
          id: p.sessionId,
          type: "Practice Test",
          subjectCode: p.bankId.slice(0, 4).toUpperCase(),
          title: p.bankName,
          progress: Math.round((p.answeredCount / p.totalQuestions) * 100),
          completedItems: p.answeredCount,
          totalItems: p.totalQuestions,
          href: `/dashboard/question-banks/${p.bankId}/practice`,
        });
      }
    }

    return list;
  }, [inProgressAssessments, inProgressContent, inProgressPractices]);

  // Real-aligned subject progress computation from database mastery + enrolled class metadata
  const subjectProgressList: readonly SubjectProgressItem[] = useMemo(() => {
    const masterySubjects = masteryData?.subjects ?? [];

    const mapped: SubjectProgressItem[] = masterySubjects.map((s) => {
      const teacherMatch = subjectTeachers.find(
        (st) =>
          st.subjectCode.toLowerCase() === s.subjectCode.toLowerCase()
      );
      const progress = s.overallAccuracy !== null ? Math.round(s.overallAccuracy) : 0;
      let status: MasteryStage = "Not Started";
      if (s.overallAccuracy !== null) {
        if (progress >= 80) status = "Mastered";
        else if (progress >= 65) status = "Doing Well";
        else if (progress > 0) status = "Learning";
      } else if (s.totalTopics > 0 && s.masteredCount > 0) {
        status = "Learning";
      }

      return {
        code: s.subjectCode,
        name: s.subjectName,
        teacher: teacherMatch?.teacherFullName ?? "Assigned Teacher",
        progress,
        status,
      };
    });

    // Merge in any class subjects not yet present in student mastery data
    for (const st of subjectTeachers) {
      if (
        !mapped.some(
          (m) => m.code.toLowerCase() === st.subjectCode.toLowerCase()
        )
      ) {
        mapped.push({
          code: st.subjectCode,
          name: st.subjectName,
          teacher: st.teacherFullName,
          progress: 0,
          status: "Not Started",
        });
      }
    }

    return mapped;
  }, [masteryData, subjectTeachers]);

  // Dynamic Topic mastery stats calculated 100% from live topic items
  const learningStats = useMemo(() => {
    if (!masteryData?.subjects || masteryData.subjects.length === 0) {
      return {
        totalTopics: 0,
        mastered: 0,
        doingWell: 0,
        learning: 0,
        notStarted: 0,
        masteredPct: 0,
        doingWellPct: 0,
        learningPct: 0,
        notStartedPct: 0,
      };
    }

    let mastered = 0;
    let doingWell = 0;
    let learning = 0;
    let notStarted = 0;
    let totalTopics = 0;

    for (const s of masteryData.subjects) {
      for (const u of s.units) {
        for (const t of u.topics) {
          totalTopics++;
          if (t.level === "MASTERED" || (t.accuracy !== null && t.accuracy >= 80)) {
            mastered++;
          } else if (t.level === "PROFICIENT" || (t.accuracy !== null && t.accuracy >= 65)) {
            doingWell++;
          } else if (t.level === "DEVELOPING" || (t.accuracy !== null && t.accuracy > 0) || t.questionCount > 0) {
            learning++;
          } else {
            notStarted++;
          }
        }
      }
    }

    // If totalTopics computed is 0, fallback to subject level totals
    if (totalTopics === 0) {
      totalTopics = masteryData.subjects.reduce((sum, s) => sum + s.totalTopics, 0);
      mastered = masteryData.subjects.reduce((sum, s) => sum + s.masteredCount, 0);
      notStarted = Math.max(0, totalTopics - mastered);
    }

    const safeTotal = totalTopics > 0 ? totalTopics : 1;

    return {
      totalTopics,
      mastered,
      doingWell,
      learning,
      notStarted,
      masteredPct: Math.round((mastered / safeTotal) * 100),
      doingWellPct: Math.round((doingWell / safeTotal) * 100),
      learningPct: Math.round((learning / safeTotal) * 100),
      notStartedPct: Math.round((notStarted / safeTotal) * 100),
    };
  }, [masteryData]);

  // SVG Donut Chart Slices Dimensions
  const donutSize = 120;
  const strokeWidth = 14;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Segment arc lengths for the 4 steps with safe division
  const totalSafe = learningStats.totalTopics > 0 ? learningStats.totalTopics : 1;
  const seg1Len = (learningStats.mastered / totalSafe) * circumference;
  const seg2Len = (learningStats.doingWell / totalSafe) * circumference;
  const seg3Len = (learningStats.learning / totalSafe) * circumference;
  const seg4Len = (learningStats.notStarted / totalSafe) * circumference;

  const seg1Offset = 0;
  const seg2Offset = -seg1Len;
  const seg3Offset = -(seg1Len + seg2Len);
  const seg4Offset = -(seg1Len + seg2Len + seg3Len);

  if (isLoading) {
    return (
      <div className="space-y-6 w-full max-w-full min-w-0">
        <div className="h-28 rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-24 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
          <div className="h-24 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-64 rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
          <div className="lg:col-span-2 h-64 rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Zone 1: Student Header & Greeting */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <GraduationCap size={14} className="shrink-0" />
              <span className="truncate">{identityLine}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words">
              {greeting}, {studentName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground break-words">
              Welcome back to your learning space.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {homeroomTeacher && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-card border border-border max-w-full">
                <Avatar className="h-8 w-8 shrink-0 border border-border">
                  {homeroomTeacher.photoUrl && (
                    <AvatarImage src={homeroomTeacher.photoUrl} alt={homeroomTeacher.fullName} />
                  )}
                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                    {getAvatarInitials(homeroomTeacher.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                    Homeroom
                  </p>
                  <p className="text-xs font-semibold text-foreground truncate">
                    {homeroomTeacher.fullName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zone 2: In Progress Activities (Above My Progress) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <PlayCircle size={18} className="text-primary" />
              <span>In Progress</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Continue your active practice exams, quizzes, and lessons
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {inProgressActivities.length} active
          </span>
        </div>

        {inProgressActivities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 sm:p-8 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PlayCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-foreground">No activities currently in progress</h3>
              <p className="text-xs text-muted-foreground">
                You do not have any unfinished exams or lessons. Start a new assessment or practice topic to build your mastery.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href={ROUTES.ASSESSMENTS.LIST}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition shadow-xs"
              >
                <span>Browse Assessments</span>
                <ChevronRight size={13} />
              </Link>
              <Link
                href={ROUTES.STUDENT.MATERIALS}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition shadow-xs"
              >
                <span>Curriculum Materials</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {inProgressActivities.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-border border-l-4 border-l-primary bg-card hover:bg-muted/20 transition-all p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-muted text-muted-foreground shrink-0">
                      {item.subjectCode}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 text-primary shrink-0">
                      {item.type}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-24 sm:w-28 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.max(item.progress, 0)}%` }}
                        />
                      </div>
                      <span className="font-bold text-foreground shrink-0">{item.progress}%</span>
                    </div>
                    <span className="shrink-0 text-[11px] sm:text-xs">
                      {item.completedItems} of {item.totalItems} completed
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-xs"
                  >
                    <span>Continue</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zone 3: My Progress Section (Donut Chart & Topics Breakdown) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <span>My Progress</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time learning mastery and subject breakdown
            </p>
          </div>
          <Link
            href={ROUTES.STUDENT.PROGRESS}
            className="text-xs font-semibold text-primary hover:underline shrink-0"
          >
            Full progress
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Overall Learning Donut Chart & Breakdown */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 flex flex-col items-center justify-between space-y-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
              Overall Learning
            </span>

            {/* Donut Chart with 'X topics' in Center */}
            <div className="relative inline-flex items-center justify-center my-1">
              <svg width={donutSize} height={donutSize} className="transform -rotate-90">
                {/* Background track */}
                <circle
                  cx={donutSize / 2}
                  cy={donutSize / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-muted/30"
                  fill="transparent"
                />
                {/* 1. Mastered — Emerald */}
                <circle
                  cx={donutSize / 2}
                  cy={donutSize / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${seg1Len} ${circumference}`}
                  strokeDashoffset={seg1Offset}
                  className="text-emerald-500 transition-all duration-700"
                  fill="transparent"
                />
                {/* 2. Doing Well — Brand Primary */}
                <circle
                  cx={donutSize / 2}
                  cy={donutSize / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${seg2Len} ${circumference}`}
                  strokeDashoffset={seg2Offset}
                  className="text-primary transition-all duration-700"
                  fill="transparent"
                />
                {/* 3. Learning — Amber */}
                <circle
                  cx={donutSize / 2}
                  cy={donutSize / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${seg3Len} ${circumference}`}
                  strokeDashoffset={seg3Offset}
                  className="text-amber-500 transition-all duration-700"
                  fill="transparent"
                />
                {/* 4. Not Started — Muted */}
                <circle
                  cx={donutSize / 2}
                  cy={donutSize / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${seg4Len} ${circumference}`}
                  strokeDashoffset={seg4Offset}
                  className="text-muted-foreground/30 transition-all duration-700"
                  fill="transparent"
                />
              </svg>

              {/* Inside center: Total topics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  {learningStats.totalTopics}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  topics
                </span>
              </div>
            </div>

            {/* Below: Your learning list */}
            <div className="w-full space-y-2 pt-2 border-t border-border/60">
              <p className="text-xs font-bold text-foreground text-left">
                Your learning
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-muted-foreground font-medium">Mastered</span>
                  </div>
                  <span className="font-bold text-foreground">{learningStats.mastered}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground font-medium">Doing Well</span>
                  </div>
                  <span className="font-bold text-foreground">{learningStats.doingWell}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-muted-foreground font-medium">Learning</span>
                  </div>
                  <span className="font-bold text-foreground">{learningStats.learning}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
                    <span className="text-muted-foreground font-medium">Not Started</span>
                  </div>
                  <span className="font-bold text-foreground">{learningStats.notStarted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Topics / Subjects Progress List with Matching Colors */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Topics & Subjects
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium">
                {subjectProgressList.length} Active Courses
              </span>
            </div>

            {subjectProgressList.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  No courses registered yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {subjectProgressList.map((item) => {
                  const isMastered = item.status === "Mastered";
                  const isDoingWell = item.status === "Doing Well";
                  const isLearning = item.status === "Learning";

                  const barColor = isMastered
                    ? "bg-emerald-500"
                    : isDoingWell
                    ? "bg-primary"
                    : isLearning
                    ? "bg-amber-500"
                    : "bg-muted-foreground/30";

                  const badgeStyle = isMastered
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : isDoingWell
                    ? "bg-primary/10 text-primary"
                    : isLearning
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-muted text-muted-foreground";

                  return (
                    <div key={item.code} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-foreground truncate">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                            ({item.teacher})
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="font-bold text-foreground">{item.progress}%</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${badgeStyle}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.max(item.progress, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
