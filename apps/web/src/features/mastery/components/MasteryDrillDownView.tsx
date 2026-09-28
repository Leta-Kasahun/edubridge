"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Target,
  Users,
  Search,
  Calendar,
} from "lucide-react";
import {
  SectionMasteryMatrixResponse,
  MasteryLevel,
} from "../types/mastery.types";
import { TopicMasteryBadge } from "./TopicMasteryBadge";
import { MasteryProgressBar } from "./MasteryProgressBar";
import { useTopicMasteryHistory } from "../hooks/useMastery";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";

interface MasteryDrillDownViewProps {
  readonly data: SectionMasteryMatrixResponse;
}

type DrillStep = "units" | "topics" | "objectives" | "students" | "evidence";

const STANDING_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "ALL", label: "All Levels" },
  { value: "MASTERED", label: "Mastered" },
  { value: "PROFICIENT", label: "Proficient" },
  { value: "DEVELOPING", label: "Developing" },
  { value: "NOT_STARTED", label: "Not Started" },
];

export function MasteryDrillDownView({
  data,
}: MasteryDrillDownViewProps): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState<DrillStep>("units");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Student list search & filter
  const [studentSearch, setStudentSearch] = useState("");
  const [standingFilter, setStandingFilter] = useState<string>("ALL");

  // Group topics by Unit
  const unitsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        unitId: string;
        unitCode: string;
        unitTitle: string;
        topics: SectionMasteryMatrixResponse["topics"];
      }
    >();

    for (const topic of data.topics) {
      const existing = map.get(topic.unitId);
      if (existing) {
        existing.topics.push(topic);
      } else {
        map.set(topic.unitId, {
          unitId: topic.unitId,
          unitCode: topic.unitCode,
          unitTitle: topic.unitTitle,
          topics: [topic],
        });
      }
    }

    return Array.from(map.values());
  }, [data.topics]);

  // Selected Unit
  const currentUnit = useMemo(() => {
    if (!selectedUnitId) return unitsMap[0] ?? null;
    return unitsMap.find((u) => u.unitId === selectedUnitId) ?? null;
  }, [unitsMap, selectedUnitId]);

  // Selected Topic
  const currentTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    return data.topics.find((t) => t.id === selectedTopicId) ?? null;
  }, [data.topics, selectedTopicId]);

  // Selected Objective
  const currentObjective = useMemo(() => {
    if (!currentTopic?.objectives || !selectedObjectiveId) return null;
    return currentTopic.objectives.find((o) => o.id === selectedObjectiveId) ?? null;
  }, [currentTopic, selectedObjectiveId]);

  // Selected Student
  const currentStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return data.students.find((s) => s.studentId === selectedStudentId) ?? null;
  }, [data.students, selectedStudentId]);

  // Fetch History for selected student & topic when on 'evidence' step
  const { data: studentHistory, isLoading: isHistoryLoading } = useTopicMasteryHistory(
    selectedStudentId ?? "",
    selectedTopicId ?? "",
    currentStep === "evidence" && Boolean(selectedStudentId && selectedTopicId)
  );

  // Navigation Helpers
  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    setSelectedTopicId(null);
    setSelectedObjectiveId(null);
    setSelectedStudentId(null);
    setCurrentStep("topics");
  };

  const handleSelectTopic = (topicId: string, directToStudents = false) => {
    setSelectedTopicId(topicId);
    setSelectedObjectiveId(null);
    setSelectedStudentId(null);
    const targetTopic = data.topics.find((t) => t.id === topicId);
    if (!directToStudents && targetTopic?.objectives && targetTopic.objectives.length > 0) {
      setCurrentStep("objectives");
    } else {
      setCurrentStep("students");
    }
  };

  const handleSelectObjective = (objectiveId: string) => {
    setSelectedObjectiveId(objectiveId);
    setCurrentStep("students");
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentStep("evidence");
  };

  const handleBack = () => {
    if (currentStep === "evidence") {
      setSelectedStudentId(null);
      setCurrentStep("students");
    } else if (currentStep === "students") {
      if (selectedObjectiveId) {
        setSelectedObjectiveId(null);
        setCurrentStep("objectives");
      } else {
        setSelectedTopicId(null);
        setCurrentStep("topics");
      }
    } else if (currentStep === "objectives") {
      setSelectedTopicId(null);
      setCurrentStep("topics");
    } else if (currentStep === "topics") {
      setSelectedUnitId(null);
      setCurrentStep("units");
    }
  };

  // Filtered Students for the Topic / Objective
  const filteredStudents = useMemo(() => {
    if (!currentTopic) return [];

    let list = data.students.map((student) => {
      const perf = student.topics[currentTopic.id];
      const level: MasteryLevel = perf?.level ?? "NOT_STARTED";
      const accuracy: number | null = perf?.accuracy ?? null;
      const questionCount = perf?.questionCount ?? 0;
      const correctCount = perf?.correctCount ?? 0;

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        rollNumber: student.rollNumber,
        level,
        accuracy,
        questionCount,
        correctCount,
      };
    });

    if (standingFilter !== "ALL") {
      list = list.filter((s) => s.level === standingFilter);
    }

    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }, [data.students, currentTopic, standingFilter, studentSearch]);

  // Topic Summary Breakdown
  const topicStats = useMemo(() => {
    if (!currentTopic) return null;

    let mastered = 0;
    let proficient = 0;
    let developing = 0;
    let notStarted = 0;
    let totalScore = 0;
    let scoredCount = 0;

    for (const st of data.students) {
      const perf = st.topics[currentTopic.id];
      const level = perf?.level ?? "NOT_STARTED";
      if (level === "MASTERED") mastered++;
      else if (level === "PROFICIENT") proficient++;
      else if (level === "DEVELOPING") developing++;
      else notStarted++;

      if (perf?.accuracy !== null && perf?.accuracy !== undefined) {
        totalScore += perf.accuracy;
        scoredCount++;
      }
    }

    const average = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;

    return {
      mastered,
      proficient,
      developing,
      notStarted,
      average,
      totalStudents: data.students.length,
    };
  }, [data.students, currentTopic]);

  return (
    <div className="space-y-4">
      {/* Interactive Breadcrumb Bar */}
      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Scrollable Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-none py-1"
          >
            {/* Class */}
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-primary" />
              Grade {data.section.gradeLevel} - {data.section.name}
            </span>

            <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />

            {/* Subject */}
            <button
              type="button"
              onClick={() => {
                setSelectedUnitId(null);
                setSelectedTopicId(null);
                setSelectedObjectiveId(null);
                setSelectedStudentId(null);
                setCurrentStep("units");
              }}
              className={`font-semibold hover:text-primary transition-colors cursor-pointer ${
                currentStep === "units" ? "text-primary" : "text-foreground"
              }`}
            >
              {data.subject.name}
            </button>

            {/* Unit */}
            {currentUnit && currentStep !== "units" && (
              <>
                <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopicId(null);
                    setSelectedObjectiveId(null);
                    setSelectedStudentId(null);
                    setCurrentStep("topics");
                  }}
                  className={`hover:text-primary transition-colors cursor-pointer truncate max-w-[140px] sm:max-w-[200px] ${
                    currentStep === "topics" ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                  title={currentUnit.unitTitle}
                >
                  {currentUnit.unitTitle}
                </button>
              </>
            )}

            {/* Topic */}
            {currentTopic && (currentStep === "objectives" || currentStep === "students" || currentStep === "evidence") && (
              <>
                <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedObjectiveId(null);
                    setSelectedStudentId(null);
                    if (currentTopic.objectives && currentTopic.objectives.length > 0) {
                      setCurrentStep("objectives");
                    } else {
                      setCurrentStep("students");
                    }
                  }}
                  className={`hover:text-primary transition-colors cursor-pointer truncate max-w-[140px] sm:max-w-[200px] ${
                    currentStep === "objectives" || currentStep === "students"
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                  title={currentTopic.title}
                >
                  {currentTopic.title}
                </button>
              </>
            )}

            {/* Objective */}
            {currentObjective && (currentStep === "students" || currentStep === "evidence") && (
              <>
                <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                <span className="text-muted-foreground truncate max-w-[120px]">
                  {currentObjective.code}
                </span>
              </>
            )}

            {/* Student */}
            {currentStudent && currentStep === "evidence" && (
              <>
                <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                <span className="text-primary font-semibold truncate max-w-[140px]">
                  {currentStudent.studentName}
                </span>
              </>
            )}
          </nav>

          {/* Back Button (Mobile & Desktop) */}
          {currentStep !== "units" && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
        </div>
      </div>

      {/* STEP 1: UNITS VIEW */}
      {currentStep === "units" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">
              Units in {data.subject.name} ({unitsMap.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              Tap a unit to explore its topics
            </span>
          </div>

          {unitsMap.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border space-y-2">
              <BookOpen className="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">No Units Configured</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No curriculum units are mapped for this subject yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {unitsMap.map((unit, idx) => {
                // Calculate average unit score
                let totalScore = 0;
                let scoredCount = 0;
                let masteredCount = 0;

                for (const t of unit.topics) {
                  for (const st of data.students) {
                    const perf = st.topics[t.id];
                    if (perf?.accuracy !== null && perf?.accuracy !== undefined) {
                      totalScore += perf.accuracy;
                      scoredCount++;
                    }
                    if (perf?.level === "MASTERED") {
                      masteredCount++;
                    }
                  }
                }

                const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;
                const totalPossible = unit.topics.length * data.students.length;
                const masteredPct = totalPossible > 0 ? Math.round((masteredCount / totalPossible) * 100) : 0;

                return (
                  <div
                    key={unit.unitId}
                    onClick={() => handleSelectUnit(unit.unitId)}
                    className="p-4 bg-card rounded-2xl border border-border hover:border-primary/40 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between gap-3.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10 uppercase">
                          Unit {idx + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {unit.topics.length} {unit.topics.length === 1 ? "Topic" : "Topics"}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {unit.unitTitle}
                      </h3>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Class Average</span>
                        <span className="font-bold text-foreground">
                          {avgScore !== null ? `${avgScore}%` : "Not evaluated"}
                        </span>
                      </div>
                      <MasteryProgressBar value={avgScore ?? 0} size="sm" />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>Mastered: {masteredPct}%</span>
                        <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                          View Topics <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: TOPICS VIEW */}
      {currentStep === "topics" && currentUnit && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {currentUnit.unitTitle} — Topics ({currentUnit.topics.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Select a topic to review learning objectives or student progress
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {currentUnit.topics.map((topic) => {
              // Topic Stats
              let mastered = 0;
              let proficient = 0;
              let developing = 0;
              let notStarted = 0;
              let totalScore = 0;
              let scored = 0;

              for (const st of data.students) {
                const perf = st.topics[topic.id];
                const level = perf?.level ?? "NOT_STARTED";
                if (level === "MASTERED") mastered++;
                else if (level === "PROFICIENT") proficient++;
                else if (level === "DEVELOPING") developing++;
                else notStarted++;

                if (perf?.accuracy !== null && perf?.accuracy !== undefined) {
                  totalScore += perf.accuracy;
                  scored++;
                }
              }

              const avgAccuracy = scored > 0 ? Math.round(totalScore / scored) : null;
              const hasObjectives = Boolean(topic.objectives && topic.objectives.length > 0);

              return (
                <div
                  key={topic.id}
                  className="p-4 bg-card rounded-2xl border border-border hover:border-primary/40 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-3.5"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {topic.code}
                      </span>
                      {hasObjectives ? (
                        <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                          {topic.objectives?.length} Objectives
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2">
                      {topic.title}
                    </h3>
                  </div>

                  {/* Standing Pill Counters */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs py-2 bg-muted/20 rounded-xl border border-border/60">
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                        Mastered
                      </span>
                      <span className="font-bold text-foreground">{mastered}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-medium">
                        Proficient
                      </span>
                      <span className="font-bold text-foreground">{proficient}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                        Developing
                      </span>
                      <span className="font-bold text-foreground">{developing}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Class Score</span>
                      <span className="font-bold text-foreground">
                        {avgAccuracy !== null ? `${avgAccuracy}%` : "—"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {hasObjectives ? (
                        <button
                          type="button"
                          onClick={() => handleSelectTopic(topic.id, false)}
                          className="h-8 px-2 rounded-xl text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Target className="w-3 h-3 text-primary" />
                          <span>Objectives</span>
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleSelectTopic(topic.id, true)}
                        className={`h-8 px-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                          !hasObjectives ? "col-span-2" : ""
                        }`}
                      >
                        <Users className="w-3 h-3" />
                        <span>Students</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: OBJECTIVES VIEW */}
      {currentStep === "objectives" && currentTopic && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {currentTopic.title} — Learning Objectives
              </h2>
              <p className="text-xs text-muted-foreground">
                Select an objective to inspect student performance
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep("students")}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Students for Topic</span>
            </button>
          </div>

          {!currentTopic.objectives || currentTopic.objectives.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border space-y-2">
              <p className="text-xs text-muted-foreground">
                No specific learning objectives listed under this topic.
              </p>
              <button
                type="button"
                onClick={() => setCurrentStep("students")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                View all students for this topic →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentTopic.objectives.map((obj, idx) => (
                <div
                  key={obj.id}
                  onClick={() => handleSelectObjective(obj.id)}
                  className="p-4 bg-card rounded-2xl border border-border hover:border-primary/40 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-primary font-semibold uppercase px-2 py-0.5 rounded-md bg-primary/10">
                        Objective {idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {obj.code}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-relaxed">
                      {obj.statement}
                    </p>
                    {obj.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {obj.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>View Student Results</span>
                    <ChevronRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 4: STUDENTS VIEW */}
      {currentStep === "students" && currentTopic && (
        <div className="space-y-3">
          {/* Header & Topic Summary */}
          <div className="p-3.5 sm:p-4 bg-card rounded-2xl border border-border shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  {currentTopic.code}
                  {currentObjective ? ` · ${currentObjective.code}` : ""}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  {currentTopic.title}
                </h2>
                {currentObjective && (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    &ldquo;{currentObjective.statement}&rdquo;
                  </p>
                )}
              </div>

              {topicStats && (
                <div className="flex items-center gap-3 text-xs bg-muted/30 p-2.5 rounded-xl border border-border shrink-0">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Average</span>
                    <span className="font-bold text-foreground text-sm">
                      {topicStats.average !== null ? `${topicStats.average}%` : "—"}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Mastered</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {topicStats.mastered} / {topicStats.totalStudents}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-border">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              {/* Status Filter Dropdown */}
              <div className="w-full sm:w-44 shrink-0">
                <SelectDropdown
                  placeholder="All Levels"
                  options={STANDING_OPTIONS as SelectDropdownOption[]}
                  value={standingFilter}
                  onChange={(val) => setStandingFilter(val)}
                />
              </div>
            </div>
          </div>

          {/* Students List */}
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
              No students match the selected filter.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((st) => (
                <div
                  key={st.studentId}
                  onClick={() => handleSelectStudent(st.studentId)}
                  className="p-3 sm:p-3.5 bg-card rounded-2xl border border-border hover:border-primary/40 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex items-center justify-between gap-3 text-xs"
                >
                  {/* Student Info */}
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {st.studentName}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {st.rollNumber ? `ID: ${st.rollNumber}` : "Student"}
                    </span>
                  </div>

                  {/* Standing & Score */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-foreground tabular-nums block">
                        {st.accuracy !== null ? `${st.accuracy}%` : "—"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {st.questionCount} {st.questionCount === 1 ? "question" : "questions"}
                      </span>
                    </div>

                    <TopicMasteryBadge level={st.level} />

                    <div className="p-1 rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 5: EVIDENCE & HISTORY VIEW */}
      {currentStep === "evidence" && currentStudent && currentTopic && (
        <div className="space-y-3">
          {/* Header Card */}
          <div className="p-4 bg-card rounded-2xl border border-border shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  Progress Records
                </span>
                <h2 className="text-base font-bold text-foreground">
                  {currentStudent.studentName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentTopic.title}
                </p>
              </div>

              {/* Current Standing Card */}
              {(() => {
                const perf = currentStudent.topics[currentTopic.id];
                const level: MasteryLevel = perf?.level ?? "NOT_STARTED";
                const accuracy = perf?.accuracy ?? null;

                return (
                  <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-border shrink-0">
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Current Score</span>
                      <span className="font-bold text-foreground text-sm">
                        {accuracy !== null ? `${accuracy}%` : "—"}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Standing</span>
                      <TopicMasteryBadge level={level} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* History List */}
          <div className="p-4 bg-card rounded-2xl border border-border shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Attempt History & Evidence
            </h3>

            {isHistoryLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size={24} />
              </div>
            ) : !studentHistory || studentHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed border-border">
                No previous attempts recorded for this student on this topic.
              </div>
            ) : (
              <div className="space-y-2">
                {studentHistory.map((item, idx) => {
                  const dateStr = item.calculatedAt
                    ? new Date(item.calculatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recorded";

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs hover:border-primary/30 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            Attempt {studentHistory.length - idx}
                          </span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{dateStr}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {item.evidenceCount} {item.evidenceCount === 1 ? "question" : "questions"} answered
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {item.masteryScore !== null && (
                          <span className="font-bold text-foreground text-xs tabular-nums">
                            {item.masteryScore}%
                          </span>
                        )}
                        <TopicMasteryBadge level={item.level} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
