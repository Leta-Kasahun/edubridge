"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/shared/hooks/useClickOutside";

export interface SelectDropdownOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly badge?: string;
  readonly disabled?: boolean;
}

export interface SelectDropdownProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly SelectDropdownOption[];
  readonly placeholder?: string;
  readonly label?: string;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly searchable?: boolean;
  readonly searchPlaceholder?: string;
  readonly emptyMessage?: string;
  readonly className?: string;
  readonly containerClassName?: string;
}

export function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  label,
  error,
  disabled = false,
  required = false,
  searchable = false,
  searchPlaceholder = "Search options...",
  emptyMessage = "No options found",
  className,
  containerClassName,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setSearchQuery("");
  });

  useEffect(() => {
    if (isOpen && (searchable || options.length > 7)) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable, options.length]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value) || null;
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.description && opt.description.toLowerCase().includes(query)) ||
        (opt.badge && opt.badge.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const showSearch = searchable || options.length > 7;

  return (
    <div className={cn("space-y-1.5 w-full min-w-0", containerClassName)} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-foreground flex items-center justify-between gap-1">
          <span className="flex items-center gap-1.5 truncate">
            {label} {required && <span className="text-destructive">*</span>}
          </span>
        </label>
      )}

      <div className="relative w-full min-w-0">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={cn(
            "w-full h-10 px-3.5 rounded-none border text-xs sm:text-sm text-foreground flex items-center justify-between gap-2 transition-all cursor-pointer select-none text-left min-w-0",
            isOpen
              ? "bg-background border-primary ring-2 ring-primary/20 shadow-xs"
              : "bg-card border-border hover:bg-muted/60 hover:border-muted-foreground/30",
            disabled && "opacity-60 cursor-not-allowed bg-muted/40",
            error && "border-destructive ring-2 ring-destructive/20",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
            <span
              className={cn(
                "truncate font-medium",
                !selectedOption && "text-muted-foreground"
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-1 text-muted-foreground">
            {selectedOption?.badge && (
              <span className="hidden xs:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                {selectedOption.badge}
              </span>
            )}
            <ChevronDown
              size={15}
              className={cn("transition-transform duration-200", isOpen && "rotate-180 text-foreground")}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 max-h-64 w-full min-w-[200px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-none shadow-xl p-1 z-50 flex flex-col animate-in fade-in-0 zoom-in-95">
            {showSearch && (
              <div className="p-1.5 border-b border-border/80 sticky top-0 bg-card rounded-none shrink-0">
                <div className="relative flex items-center">
                  <Search size={13} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full h-8 pl-8 pr-7 text-xs bg-muted/50 border border-border rounded-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:border-primary transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-y-auto flex-1 p-0.5 space-y-0.5 max-h-52">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-2.5 py-2 text-xs rounded-none transition-colors cursor-pointer text-left min-h-[36px]",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold border border-primary/20"
                          : "text-foreground hover:bg-muted/70 font-medium",
                        opt.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                        <div className="truncate min-w-0">
                          <p className="truncate">{opt.label}</p>
                          {opt.description && (
                            <p className="text-[10px] text-muted-foreground truncate font-normal">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {opt.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-primary shrink-0" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-destructive font-medium tracking-tight">{error}</p>}
    </div>
  );
}
