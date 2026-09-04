import React from "react";
import {
  BookOpen,
  FileText,
  Video,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  FileCheck2,
  FileQuestion,
  GraduationCap,
  Bookmark,
  File,
} from "lucide-react";
import {
  ContentType,
  ContentScope,
  LearningContentListItem,
} from "../types/content.types";

export function formatContentTypeLabel(type: ContentType): string {
  switch (type) {
    case "TEXTBOOK":
      return "Textbook";
    case "REFERENCE_BOOK":
      return "Reference Book";
    case "WORKSHEET":
      return "Worksheet";
    case "EXERCISE":
      return "Exercise";
    case "PAST_EXAM_PAPER":
      return "Past Exam";
    case "TEACHER_GUIDE":
      return "Teacher Guide";
    case "STUDY_GUIDE":
      return "Study Guide";
    case "LESSON":
      return "Lesson";
    case "VIDEO":
      return "Video";
    case "PDF":
      return "PDF";
    case "IMAGE":
      return "Image";
    case "LINK":
      return "Link";
    case "NOTE":
      return "Note";
    case "TEXT":
    default:
      return "Text";
  }
}

export function formatContentScopeLabel(scope: ContentScope): string {
  switch (scope) {
    case "SUBJECT":
      return "Subject";
    case "GRADE_SUBJECT":
      return "Grade";
    case "UNIT":
      return "Unit";
    case "TOPIC":
    default:
      return "Topic";
  }
}

export function getContentIcon(type: ContentType): React.ElementType {
  switch (type) {
    case "TEXTBOOK":
    case "REFERENCE_BOOK":
      return BookOpen;
    case "WORKSHEET":
    case "EXERCISE":
      return FileCheck2;
    case "PAST_EXAM_PAPER":
      return FileQuestion;
    case "TEACHER_GUIDE":
      return GraduationCap;
    case "STUDY_GUIDE":
      return Bookmark;
    case "VIDEO":
      return Video;
    case "IMAGE":
      return ImageIcon;
    case "LINK":
      return ExternalLink;
    case "LESSON":
      return Layers;
    case "PDF":
    case "NOTE":
      return FileText;
    case "TEXT":
    default:
      return File;
  }
}

export function formatContentAlignment(item: LearningContentListItem): string {
  if (item.primaryTopic) {
    return `${item.primaryTopic.topicCode}: ${item.primaryTopic.topicTitle}`;
  }

  if (item.unitTitle) {
    if (item.subjectName && item.gradeLevel) {
      return `Grade ${item.gradeLevel} ${item.subjectName} • ${item.unitTitle}`;
    }
    return item.unitTitle;
  }

  if (item.targetGradeLevels && item.targetGradeLevels.length > 1) {
    const gradesStr = `Grades ${[...item.targetGradeLevels].sort((a, b) => a - b).join(", ")}`;
    return item.subjectName ? `${gradesStr} • ${item.subjectName}` : gradesStr;
  }

  if (item.gradeLevel && item.subjectName) {
    return `Grade ${item.gradeLevel} • ${item.subjectName}`;
  }

  if (item.subjectName) {
    return item.subjectName;
  }

  return "General";
}
