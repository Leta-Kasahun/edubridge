import { ContentScope } from "../../types/content.types";
import { formatContentScopeLabel } from "../../utils/content-format.util";

interface ContentScopeBadgeProps {
  readonly scope: ContentScope;
}

export function ContentScopeBadge({ scope }: ContentScopeBadgeProps) {
  const label = formatContentScopeLabel(scope);

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/70 text-muted-foreground border border-border">
      {label}
    </span>
  );
}
