"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SearchQueryContext = createContext<string>("");

export function SearchQueryProvider({
  query,
  children,
}: {
  readonly query?: string | null;
  readonly children: ReactNode;
}) {
  return (
    <SearchQueryContext.Provider value={query ?? ""}>
      {children}
    </SearchQueryContext.Provider>
  );
}

export function useSearchQuery(): string {
  return useContext(SearchQueryContext);
}

export interface SearchHighlightProps {
  readonly text?: string | number | null;
  readonly query?: string | null;
  readonly className?: string;
  readonly highlightClassName?: string;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function SearchHighlight({
  text,
  query: queryProp,
  className,
  highlightClassName,
}: SearchHighlightProps) {
  const contextQuery = useSearchQuery();
  const rawQuery = (
    queryProp !== undefined && queryProp !== null ? queryProp : contextQuery
  ).trim();

  const stringText = text === null || text === undefined ? "" : String(text);

  const parts = useMemo(() => {
    if (!rawQuery || !stringText) {
      return [{ text: stringText, isMatch: false, key: "plain" }];
    }

    const tokens = rawQuery.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return [{ text: stringText, isMatch: false, key: "plain" }];
    }

    const sortedTokens = [...tokens].sort((a, b) => b.length - a.length);
    const pattern = sortedTokens.map(escapeRegExp).join("|");
    const regex = new RegExp(`(${pattern})`, "gi");
    const rawSegments = stringText.split(regex);

    const tokenSet = new Set(tokens.map((t) => t.toLowerCase()));
    const occurrences = new Map<string, number>();

    return rawSegments.filter(Boolean).map((segment, index) => {
      const isMatch = tokenSet.has(segment.toLowerCase());
      const count = occurrences.get(segment) ?? 0;
      occurrences.set(segment, count + 1);

      return {
        text: segment,
        isMatch,
        key: `${isMatch ? "m" : "t"}_${segment}_${count}_${index}`,
      };
    });
  }, [rawQuery, stringText]);

  if (!rawQuery || !stringText) {
    return <span className={className}>{stringText}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part) =>
        part.isMatch ? (
          <mark
            key={part.key}
            className={cn(
              "bg-accent/25 text-foreground font-semibold px-0.5 rounded-none border-b-2 border-accent dark:bg-accent/30 dark:text-orange-200",
              highlightClassName
            )}
          >
            {part.text}
          </mark>
        ) : (
          <span key={part.key}>{part.text}</span>
        )
      )}
    </span>
  );
}

export default SearchHighlight;
