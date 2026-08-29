"use client";

import { useState, useRef } from "react";
import { Search, X, ChevronDown, Check, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/shared/hooks/useClickOutside";

export interface FilterOption {
  readonly label: string;
  readonly value: string;
  readonly count?: number;
}

export interface FilterGroup {
  readonly id: string;
  readonly label: string;
  readonly options: readonly FilterOption[];
  readonly selectedValue: string;
  readonly onSelect: (value: string) => void;
  readonly icon?: React.ElementType;
}

export interface TableToolbarProps {
  readonly searchValue: string;
  readonly onSearchChange: (value: string) => void;
  readonly searchPlaceholder?: string;
  readonly searchSuggestions?: readonly string[];
  readonly filters?: readonly FilterGroup[];
  readonly actionButton?: React.ReactNode;
  readonly className?: string;
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchSuggestions = [],
  filters = [],
  actionButton,
  className,
}: TableToolbarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  useClickOutside(searchContainerRef, () => setShowSuggestions(false));
  useClickOutside(filterContainerRef, () => setOpenFilterId(null));

  const filteredSuggestions = searchSuggestions.filter(
    (s) =>
      s.toLowerCase().includes(searchValue.toLowerCase()) &&
      s.toLowerCase() !== searchValue.toLowerCase()
  );

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full",
        className
      )}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
        <div ref={searchContainerRef} className="relative flex-1 sm:max-w-xs min-w-[180px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />

          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSuggestions(true);
            }}
            className="w-full h-9 pl-9 pr-8 text-xs bg-muted/40 focus:bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
          />

          {searchValue && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                setShowSuggestions(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
            >
              <X size={13} />
            </button>
          )}

          {showSuggestions && searchValue.length > 0 && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 top-10 w-full bg-card border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in-0 zoom-in-95">
              <div className="text-[10px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                Suggestions
              </div>
              {filteredSuggestions.slice(0, 5).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    onSearchChange(item);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer truncate"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {filters.length > 0 && (
          <div
            ref={filterContainerRef}
            className="flex items-center gap-2 flex-wrap shrink-0"
          >
            {filters.map((group) => {
              const isOpen = openFilterId === group.id;
              const selectedOption = group.options.find(
                (o) => o.value === group.selectedValue
              );
              const GroupIcon = group.icon || Filter;

              return (
                <div key={group.id} className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFilterId(isOpen ? null : group.id)
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap",
                      group.selectedValue && group.selectedValue !== "ALL"
                        ? "bg-muted/80 border-border text-foreground"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    )}
                  >
                    <GroupIcon size={13} className="text-muted-foreground" />
                    <span className="text-muted-foreground font-normal">{group.label}:</span>
                    <span className="font-semibold text-foreground">
                      {selectedOption ? selectedOption.label : "All"}
                    </span>
                    <ChevronDown size={13} className="text-muted-foreground ml-0.5" />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 top-10 w-48 bg-card border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in-0 zoom-in-95">
                      {group.options.map((opt) => {
                        const isSelected = group.selectedValue === opt.value;

                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              group.onSelect(opt.value);
                              setOpenFilterId(null);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left",
                              isSelected
                                ? "bg-muted font-bold text-foreground"
                                : "text-foreground hover:bg-muted/60 font-medium"
                            )}
                          >
                            <span className="truncate">{opt.label}</span>
                            {isSelected && <Check size={13} className="text-foreground" />}
                            {!isSelected && opt.count !== undefined && (
                              <span className="text-[10px] text-muted-foreground">
                                {opt.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {actionButton && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {actionButton}
        </div>
      )}
    </div>
  );
}
