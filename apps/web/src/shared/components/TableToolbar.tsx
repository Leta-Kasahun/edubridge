"use client";

import { useState, useRef, useMemo } from "react";
import { Search, X, Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { SearchHighlight } from "./SearchHighlight";

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

interface FacetedFilterItemProps {
  readonly group: FilterGroup;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly onClose: () => void;
}

function FacetedFilterItem({
  group,
  isOpen,
  onToggle,
  onClose,
}: FacetedFilterItemProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter out redundant "All" option from the menu because unselected filter implicitly means "All"
  const cleanOptions = useMemo(() => {
    return group.options.filter(
      (opt) =>
        opt.value !== "" &&
        opt.value !== "ALL" &&
        opt.value !== "all" &&
        !opt.label.toLowerCase().startsWith("all ") &&
        opt.label.toLowerCase() !== "all"
    );
  }, [group.options]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return cleanOptions;
    const q = search.toLowerCase().trim();
    return cleanOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [cleanOptions, search]);

  const selectedOption = cleanOptions.find((o) => o.value === group.selectedValue);
  const isFiltered = Boolean(
    group.selectedValue &&
      group.selectedValue !== "ALL" &&
      group.selectedValue !== ""
  );

  const handleSelect = (val: string) => {
    if (group.selectedValue === val) {
      const hasAllDefault = group.options.some((o) => o.value === "ALL");
      group.onSelect(hasAllDefault ? "ALL" : "");
    } else {
      group.onSelect(val);
    }
    onClose();
    setSearch("");
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const hasAllDefault = group.options.some((o) => o.value === "ALL");
    group.onSelect(hasAllDefault ? "ALL" : "");
    onClose();
    setSearch("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-2.5 rounded-none text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap select-none",
          isFiltered
            ? "border-primary/40 bg-primary/5 text-foreground hover:bg-primary/10"
            : "border-dashed border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        <PlusCircle
          size={13}
          className={cn(isFiltered ? "text-primary" : "text-muted-foreground")}
        />
        <span className="font-medium">{group.label}</span>

        {isFiltered && selectedOption && (
          <>
            <div className="h-3.5 w-px bg-border mx-0.5 shrink-0" />
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/15 text-primary rounded-none border border-primary/25">
              {selectedOption.label}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear()}
              className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer ml-0.5"
              aria-label={`Clear ${group.label} filter`}
            >
              <X size={11} />
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-10 w-52 max-w-[calc(100vw-2.5rem)] bg-card border border-border rounded-none shadow-xl p-1 z-30 animate-in fade-in-0 zoom-in-95">
          {cleanOptions.length > 3 && (
            <div className="p-1 border-b border-border mb-1">
              <div className="relative flex items-center">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${group.label}...`}
                  className="w-full h-7.5 pl-8 pr-6 text-[11px] bg-muted/50 border border-border rounded-none text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:bg-background focus:border-primary transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-[11px] text-muted-foreground">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = group.selectedValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-none transition-colors cursor-pointer text-left",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted font-medium"
                    )}
                  >
                    <span className="truncate">
                      <SearchHighlight text={opt.label} query={search} />
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {opt.count !== undefined && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {opt.count}
                        </span>
                      )}
                      {isSelected && (
                        <Check size={13} className="text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {isFiltered && (
            <div className="pt-1 mt-1 border-t border-border">
              <button
                type="button"
                onClick={handleClear}
                className="w-full py-1 text-center text-[11px] text-muted-foreground hover:text-destructive hover:bg-muted font-medium transition-colors cursor-pointer rounded-none"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
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

  const hasActiveFilters = filters.some(
    (g) => g.selectedValue && g.selectedValue !== "ALL" && g.selectedValue !== ""
  );

  const handleResetAllFilters = () => {
    filters.forEach((g) => {
      const hasAllDefault = g.options.some((o) => o.value === "ALL");
      g.onSelect(hasAllDefault ? "ALL" : "");
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
        <div ref={searchContainerRef} className="relative w-full sm:max-w-xs min-w-0">
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
            className="w-full h-9 pl-9 pr-8 text-xs bg-muted/40 focus:bg-background border border-border rounded-none text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
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

          {showSuggestions &&
            searchValue.length > 0 &&
            filteredSuggestions.length > 0 && (
              <div className="absolute left-0 top-10 w-full bg-card border border-border rounded-none shadow-lg p-1 z-30 animate-in fade-in-0 zoom-in-95">
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
                    className="w-full text-left px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-none transition-colors cursor-pointer truncate"
                  >
                    <SearchHighlight text={item} query={searchValue} />
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
            {filters.map((group) => (
              <FacetedFilterItem
                key={group.id}
                group={group}
                isOpen={openFilterId === group.id}
                onToggle={() =>
                  setOpenFilterId(openFilterId === group.id ? null : group.id)
                }
                onClose={() => setOpenFilterId(null)}
              />
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="inline-flex items-center gap-1 h-9 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-none hover:bg-muted/50"
              >
                <span>Reset</span>
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {actionButton && (
        <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
          {actionButton}
        </div>
      )}
    </div>
  );
}
