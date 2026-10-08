"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import {
  SectionMasteryMatrixResponse,
  MasteryLevel,
  StudentSectionMatrixItem,
} from "../types/mastery.types";
import { TopicMasteryBadge } from "./TopicMasteryBadge";
import { MasteryProgressBar } from "./MasteryProgressBar";
import { MasteryHistoryModal } from "./MasteryHistoryModal";

interface SectionMasteryTableProps {
  readonly data: SectionMasteryMatrixResponse;
  readonly isLoading?: boolean;
  readonly isFetching?: boolean;
  readonly onRefresh?: () => void;
}

export function SectionMasteryTable({
  data,
  isLoading = false,
  isFetching = false,
  onRefresh,
}: SectionMasteryTableProps): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedCell, setSelectedCell] = useState<{
    studentId: string;
    studentName: string;
    topicId: string;
    topicTitle: string;
    currentLevel: MasteryLevel;
    currentAccuracy?: number | null;
  } | null>(null);

  // Group topics by Unit for hierarchical table headers
  const unitGroupedTopics = useMemo(() => {
    const map = new Map<
      string,
      {
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
          unitTitle: topic.unitTitle,
          topics: [topic],
        });
      }
    }

    return Array.from(map.entries()).map(([unitId, group]) => ({
      unitId,
      unitTitle: group.unitTitle,
      topics: group.topics,
    }));
  }, [data.topics]);

  // Filter students by name or roll number
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.students;

    return data.students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(q))
    );
  }, [data.students, search]);

  return (
    <div className="space-y-4">
      {/* Toolbar & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
            />
          </div>
        </div>

        {/* Legend & Refresh Button */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Mastered (&ge;80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Doing Well (65-79%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Needs Practice (&lt;65%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
            <span>Not Started</span>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading || isFetching}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer ml-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Class Overview Table */}
      {data.topics.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border space-y-2">
          <BookOpen className="w-8 h-8 text-muted-foreground/50 mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">
            No Topics Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            There are no curriculum topics configured for this grade and subject.
          </p>
        </div>
      ) : (
        <div className="relative bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              {/* Top Unit Group Header Row */}
              <thead className="sticky top-0 z-30 bg-muted/80 backdrop-blur-md">
                <tr className="border-b border-border text-muted-foreground">
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-40 bg-muted/95 backdrop-blur-md p-3 font-semibold text-foreground border-r border-border min-w-[200px]"
                  >
                    Student
                  </th>

                  {unitGroupedTopics.map((group) => (
                    <th
                      key={group.unitId}
                      colSpan={group.topics.length}
                      className="p-2 font-semibold text-center text-foreground border-r border-border bg-muted/60"
                    >
                      {group.unitTitle}
                    </th>
                  ))}

                  <th
                    rowSpan={2}
                    className="p-3 font-semibold text-center text-foreground border-l border-border min-w-[120px]"
                  >
                    Score
                  </th>
                  <th
                    rowSpan={2}
                    className="p-3 font-semibold text-center text-foreground min-w-[100px]"
                  >
                    Mastered
                  </th>
                </tr>

                {/* Sub-header row with specific topic titles */}
                <tr className="border-b border-border text-muted-foreground bg-muted/40">
                  {data.topics.map((t) => (
                    <th
                      key={t.id}
                      title={t.title}
                      className="p-2 text-center font-medium border-r border-border min-w-[100px] max-w-[130px] truncate"
                    >
                      <div className="truncate font-semibold text-foreground">{t.title}</div>
                      <div className="text-[10px] text-muted-foreground">{t.code}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-border">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={data.topics.length + 3}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student: StudentSectionMatrixItem) => (
                    <tr
                      key={student.studentId}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Sticky Student Column */}
                      <td className="sticky left-0 z-20 bg-card p-3 border-r border-border">
                        <div className="font-semibold text-foreground text-xs">
                          {student.studentName}
                        </div>
                        {student.rollNumber && (
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {student.rollNumber}
                          </div>
                        )}
                      </td>

                      {/* Topic Cells */}
                      {data.topics.map((topic) => {
                        const perf = student.topics[topic.id];
                        const level = perf?.level ?? "NOT_STARTED";
                        const accuracy = perf?.accuracy ?? null;

                        return (
                          <td
                            key={topic.id}
                            className="p-2 text-center border-r border-border hover:bg-primary/5 transition-colors cursor-pointer group"
                            onClick={() =>
                              setSelectedCell({
                                studentId: student.studentId,
                                studentName: student.studentName,
                                topicId: topic.id,
                                topicTitle: topic.title,
                                currentLevel: level,
                                currentAccuracy: accuracy,
                              })
                            }
                          >
                            <div className="flex flex-col items-center justify-center gap-1">
                              <TopicMasteryBadge level={level} compact />
                              <span className="text-[11px] font-semibold tabular-nums text-foreground group-hover:text-primary transition-colors">
                                {accuracy !== null ? `${accuracy}%` : "—"}
                              </span>
                              <span className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity text-primary">
                                <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            </div>
                          </td>
                        );
                      })}

                      {/* Score Column */}
                      <td className="p-3 border-l border-border text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-xs text-foreground">
                            {student.overallAccuracy !== null ? `${student.overallAccuracy}%` : "—"}
                          </span>
                          {student.overallAccuracy !== null && (
                            <MasteryProgressBar
                              value={student.overallAccuracy}
                              size="sm"
                              className="w-16"
                            />
                          )}
                        </div>
                      </td>

                      {/* Mastered Count Column */}
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          {student.masteredTopicCount} / {data.topics.length}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drill-down Detail Modal */}
      {selectedCell && (
        <MasteryHistoryModal
          open={Boolean(selectedCell)}
          onOpenChange={(open) => {
            if (!open) setSelectedCell(null);
          }}
          studentId={selectedCell.studentId}
          studentName={selectedCell.studentName}
          topicId={selectedCell.topicId}
          topicTitle={selectedCell.topicTitle}
          currentLevel={selectedCell.currentLevel}
          currentAccuracy={selectedCell.currentAccuracy}
        />
      )}
    </div>
  );
}
