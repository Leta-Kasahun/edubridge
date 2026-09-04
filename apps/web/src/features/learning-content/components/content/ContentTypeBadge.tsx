import { ContentType } from "../../types/content.types";
import { formatContentTypeLabel } from "../../utils/content-format.util";

interface ContentTypeBadgeProps {
  readonly type: ContentType;
}

export function ContentTypeBadge({ type }: ContentTypeBadgeProps) {
  const label = formatContentTypeLabel(type);

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
      {label}
    </span>
  );
}
