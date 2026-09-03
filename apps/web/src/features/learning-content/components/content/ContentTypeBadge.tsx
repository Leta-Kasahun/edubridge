import { ContentType } from "../../types/content.types";

interface ContentTypeBadgeProps {
  readonly type: ContentType;
}

export function ContentTypeBadge({ type }: ContentTypeBadgeProps) {
  switch (type) {
    case "LESSON":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
          Lesson
        </span>
      );
    case "PDF":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
          PDF
        </span>
      );
    case "VIDEO":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
          Video
        </span>
      );
    case "NOTE":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
          Note
        </span>
      );
    case "IMAGE":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
          Image
        </span>
      );
    case "LINK":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
          Link
        </span>
      );
    case "TEXT":
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
          Text
        </span>
      );
  }
}
