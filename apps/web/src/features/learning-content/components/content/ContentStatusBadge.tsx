import { ContentStatus } from "../../types/content.types";

interface ContentStatusBadgeProps {
  readonly status: ContentStatus;
}

export function ContentStatusBadge({ status }: ContentStatusBadgeProps) {
  switch (status) {
    case "PUBLISHED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Published
        </span>
      );
    case "PENDING_REVIEW":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          In Review
        </span>
      );
    case "APPROVED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
          Approved
        </span>
      );
    case "ARCHIVED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          Archived
        </span>
      );
    case "DRAFT":
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Draft
        </span>
      );
  }
}
