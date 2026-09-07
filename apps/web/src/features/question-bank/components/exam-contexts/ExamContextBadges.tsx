"use client";

import { ExamScope, ExamContextStatus } from "../../types/question-bank.types";

export function ScopeBadge({ scope }: { readonly scope: ExamScope }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
      {scope}
    </span>
  );
}

export function ContextStatusBadge({ status }: { readonly status: ExamContextStatus }) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
          Active
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          Draft
        </span>
      );
    case "ARCHIVED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          Archived
        </span>
      );
  }
}
