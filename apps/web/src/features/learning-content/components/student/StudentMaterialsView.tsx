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
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  HelpCircle,
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

function getActionLabel(type: ContentType): string {
  switch (type) {
    case "VIDEO":
      return "Watch Video";
    case "TEXTBOOK":
      return "Open Textbook";
    case "REFERENCE_BOOK":
      return "Open Reference";
    case "WORKSHEET":
      return "View Worksheet";
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
      <div className="space-y-6">
        <div className="h-20 rounded-2xl bg-muted/60 animate-pulse border border-border/40" />
        <div className="h-10 rounded-xl bg-muted/50 animate-pulse border border-border/40 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-muted/50 animate-pulse border border-border/40"
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
        message={error instanceof Error ? error.message : "We could not load your learning materials at this time. Please try refreshing."}
        className="rounded-2xl"
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Digital Learning Library
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              My Learning Materials
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Access your textbooks, study guides, lesson notes, and interactive learning resources.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, lessons, books..."
              className="w-full rounded-xl border border-border bg-card/80 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 backdrop-blur-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedSubjectId("ALL")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
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
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
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
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              Textbooks & Reference Books
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {textbooks.map((book) => (
              <div
                key={book.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/20">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                      {book.subjectName || "General"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>

                  {book.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {book.type === "TEXTBOOK" ? "Textbook" : "Reference Book"}
                  </span>
                  <Link
                    href={`/learn/${book.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
                  >
                    {getActionLabel(book.type)}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              Topics & Lessons
            </h2>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {unitGroups.length} {unitGroups.length === 1 ? "Unit" : "Units"}
          </span>
        </div>

        {unitGroups.length > 0 ? (
          <div className="space-y-4">
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
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-muted/20 hover:bg-muted/40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          {group.unitTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {group.subjectName} · {group.items.length} {group.items.length === 1 ? "Lesson" : "Lessons"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="p-3 sm:p-4 space-y-2 divide-y divide-border/40">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-muted/30 transition"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card border border-border/80 shadow-xs">
                              {getContentIcon(item.type)}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-foreground">
                                  {item.title}
                                </h4>
                                <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                                  {item.type}
                                </span>
                              </div>
                              {item.primaryTopic?.topicTitle && (
                                <p className="text-xs text-muted-foreground">
                                  Topic: {item.primaryTopic.topicTitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end">
                            <Link
                              href={`/learn/${item.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-xs transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                            >
                              {getActionLabel(item.type)}
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
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No learning materials found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
