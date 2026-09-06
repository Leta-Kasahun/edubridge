"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Video,
  FileText,
  Layers,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  HelpCircle,
  FolderOpen,
} from "lucide-react";
import { useContentList } from "../../hooks/useLearningContent";
import { LearningContentListItem, ContentType } from "../../types/content.types";
import { ErrorAlert } from "@/shared/components/ErrorAlert";

const TEXTBOOK_TYPES: readonly ContentType[] = [
  "TEXTBOOK",
  "REFERENCE_BOOK",
  "STUDY_GUIDE",
  "TEACHER_GUIDE",
];

function getContentIcon(type: ContentType) {
  switch (type) {
    case "VIDEO":
      return <Video className="h-4 w-4 text-blue-500" />;
    case "TEXTBOOK":
    case "REFERENCE_BOOK":
      return <BookOpen className="h-4 w-4 text-emerald-500" />;
    case "WORKSHEET":
    case "EXERCISE":
      return <FileSpreadsheet className="h-4 w-4 text-amber-500" />;
    case "PAST_EXAM_PAPER":
      return <HelpCircle className="h-4 w-4 text-purple-500" />;
    default:
      return <FileText className="h-4 w-4 text-primary" />;
  }
}

function getContentTypeLabel(type: ContentType): string {
  switch (type) {
    case "VIDEO":
      return "Video Lesson";
    case "TEXTBOOK":
      return "Curriculum Textbook";
    case "REFERENCE_BOOK":
      return "Reference Guide";
    case "STUDY_GUIDE":
      return "Study Guide";
    case "TEACHER_GUIDE":
      return "Teacher Guide";
    case "WORKSHEET":
      return "Worksheet";
    case "EXERCISE":
      return "Practice Exercise";
    case "PAST_EXAM_PAPER":
      return "Past Exam Paper";
    default:
      return "Lesson Material";
  }
}

function getActionLabel(type: ContentType): string {
  switch (type) {
    case "VIDEO":
      return "Watch Video";
    case "TEXTBOOK":
      return "Open Textbook";
    case "REFERENCE_BOOK":
      return "Open Reference";
    case "STUDY_GUIDE":
      return "Start Study Guide";
    case "TEACHER_GUIDE":
      return "Open Guide";
    case "WORKSHEET":
      return "View Worksheet";
    case "EXERCISE":
      return "Start Practice";
    case "PAST_EXAM_PAPER":
      return "Practice Exam";
    default:
      return "Start Lesson";
  }
}

export function StudentMaterialsView(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ALL");
  const [collapsedUnits, setCollapsedUnits] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError, error } = useContentList({
    limit: 100,
  });

  const allItems: readonly LearningContentListItem[] = useMemo(() => {
    return data?.data ?? [];
  }, [data]);

  const subjects = useMemo(() => {
    const subjectMap = new Map<string, { id: string; name: string; count: number }>();
    for (const item of allItems) {
      const id = item.subjectId || "general";
      const name = item.subjectName || "General";
      const existing = subjectMap.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        subjectMap.set(id, { id, name, count: 1 });
      }
    }
    return Array.from(subjectMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.unitTitle && item.unitTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.primaryTopic?.topicTitle &&
          item.primaryTopic.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject =
        selectedSubjectId === "ALL" || (item.subjectId || "general") === selectedSubjectId;

      return matchesSearch && matchesSubject;
    });
  }, [allItems, searchQuery, selectedSubjectId]);

  const textbooks = useMemo(() => {
    return filteredItems.filter((item) => TEXTBOOK_TYPES.includes(item.type));
  }, [filteredItems]);

  const unitGroups = useMemo(() => {
    const lessons = filteredItems.filter((item) => !TEXTBOOK_TYPES.includes(item.type));
    const groups = new Map<
      string,
      {
        unitId: string;
        unitTitle: string;
        subjectName: string;
        items: LearningContentListItem[];
      }
    >();

    for (const item of lessons) {
      const unitKey = item.unitId || "general-topics";
      const unitTitle = item.unitTitle || "General Lessons";
      const subjectName = item.subjectName || "General";

      const existing = groups.get(unitKey);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.set(unitKey, {
          unitId: unitKey,
          unitTitle,
          subjectName,
          items: [item],
        });
      }
    }

    return Array.from(groups.values());
  }, [filteredItems]);

  const toggleUnit = (unitId: string) => {
    setCollapsedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="space-y-2">
          <div className="h-8 rounded-xl bg-muted/50 animate-pulse border border-border/40 w-56" />
          <div className="h-4 rounded-xl bg-muted/40 animate-pulse border border-border/40 w-72" />
        </div>
        <div className="h-10 rounded-xl bg-muted/40 animate-pulse border border-border/40 w-full" />
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
        title="Unable to load learning materials"
        message={
          error instanceof Error
            ? error.message
            : "We could not load your learning materials at this time. Please try refreshing the page."
        }
        className="rounded-2xl"
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Learning Materials
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredItems.length} {filteredItems.length === 1 ? "resource" : "resources"} available for your grade &bull; Choose any subject or textbook to begin studying
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, lessons, books..."
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
            {allItems.length}
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

      {textbooks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Textbooks & Reference Books
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border/60">
              {textbooks.length} {textbooks.length === 1 ? "Book" : "Books"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {textbooks.map((book) => (
              <div
                key={book.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">
                        {book.subjectName || "General"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    {book.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {getContentTypeLabel(book.type)}
                  </span>
                  <Link
                    href={`/learn/${book.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 cursor-pointer"
                  >
                    <span>{getActionLabel(book.type)}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Topics & Lessons
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border/60">
            {unitGroups.length} {unitGroups.length === 1 ? "Unit" : "Units"}
          </span>
        </div>

        {unitGroups.length > 0 ? (
          <div className="space-y-3">
            {unitGroups.map((group) => {
              const isCollapsed = collapsedUnits[group.unitId] ?? false;
              return (
                <div
                  key={group.unitId}
                  className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleUnit(group.unitId)}
                    className="w-full flex items-center justify-between p-4 text-left bg-muted/20 hover:bg-muted/40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {group.unitTitle}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {group.subjectName} &bull; {group.items.length} {group.items.length === 1 ? "Lesson" : "Lessons"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="p-3 space-y-1.5 divide-y divide-border/40">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card border border-border/80 shadow-xs">
                              {getContentIcon(item.type)}
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                                {item.title}
                              </h4>
                              {item.primaryTopic?.topicTitle && (
                                <p className="text-[11px] text-muted-foreground">
                                  Topic: {item.primaryTopic.topicTitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <span className="text-[11px] font-medium text-muted-foreground sm:hidden">
                              {getContentTypeLabel(item.type)}
                            </span>
                            <Link
                              href={`/learn/${item.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90 cursor-pointer"
                            >
                              <span>{getActionLabel(item.type)}</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center bg-card shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">
              No Learning Materials Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              No curriculum textbooks or lesson materials match your current filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
