"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { getEthiopianDateInfo } from "@/shared/utils/ethiopian-calendar.util";

export interface DatePickerProps {
  readonly id?: string;
  readonly value?: string; // Format: YYYY-MM-DD
  readonly onChange: (value: string) => void;
  readonly label?: string;
  readonly placeholder?: string;
  readonly min?: string; // Format: YYYY-MM-DD
  readonly max?: string; // Format: YYYY-MM-DD
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly error?: string;
  readonly hint?: string;
  readonly showEthiopianReference?: boolean;
  readonly align?: "left" | "right";
  readonly className?: string;
  readonly containerClassName?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`;
}

function parseDateString(str: string): { year: number; month: number; day: number } | null {
  if (!str) return null;
  const parts = str.split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

function formatDisplayDate(dateStr: string): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return "";
  const monthName = MONTH_NAMES[parsed.month]?.slice(0, 3) ?? "";
  return `${monthName} ${parsed.day}, ${parsed.year}`;
}

export function DatePicker({
  id,
  value = "",
  onChange,
  label,
  placeholder = "Select date...",
  min,
  max,
  disabled = false,
  required = false,
  error,
  hint,
  showEthiopianReference = true,
  align = "left",
  className,
  containerClassName,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const yearMenuRef = useRef<HTMLDivElement>(null);

  // Initialize view year & month from selected value or today
  const initialDate = useMemo(() => {
    const parsed = parseDateString(value);
    if (parsed) return { year: parsed.year, month: parsed.month };
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(initialDate.year);
  const [viewMonth, setViewMonth] = useState<number>(initialDate.month);

  // Sync view when opened with a value
  useEffect(() => {
    if (isOpen && value) {
      const parsed = parseDateString(value);
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      }
    }
  }, [isOpen, value]);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setIsMonthOpen(false);
    setIsYearOpen(false);
  });

  // Auto-scroll selected year into view when year dropdown opens
  useEffect(() => {
    if (isYearOpen && yearMenuRef.current) {
      const selectedEl = yearMenuRef.current.querySelector<HTMLElement>('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "center", behavior: "instant" });
      }
    }
  }, [isYearOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (isMonthOpen) {
        setIsMonthOpen(false);
      } else if (isYearOpen) {
        setIsYearOpen(false);
      } else {
        setIsOpen(false);
      }
    }
  }, [isMonthOpen, isYearOpen]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Year range boundaries
  const parsedMin = useMemo(() => parseDateString(min ?? ""), [min]);
  const parsedMax = useMemo(() => parseDateString(max ?? ""), [max]);

  const minYear = parsedMin ? parsedMin.year : Math.min(viewYear - 50, 1950);
  const maxYear = parsedMax ? parsedMax.year : Math.max(viewYear + 20, 2050);

  const yearsList = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  // Ethiopian reference info for currently selected value
  const ethiopianInfo = useMemo(() => {
    if (!showEthiopianReference || !value) return null;
    return getEthiopianDateInfo(value);
  }, [showEthiopianReference, value]);

  // Ethiopian reference info for currently viewed month
  const viewMonthEthiopianInfo = useMemo(() => {
    if (!showEthiopianReference) return null;
    const midMonthDate = new Date(viewYear, viewMonth, 15);
    return getEthiopianDateInfo(midMonthDate);
  }, [showEthiopianReference, viewYear, viewMonth]);

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((prev) => prev - 1);
      setViewMonth(11);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((prev) => prev + 1);
      setViewMonth(0);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      dateString: string;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      isDisabled: boolean;
    }> = [];

    const todayStr = formatDateString(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = formatDateString(prevYear, prevMonth, dayNum);

      let isDisabled = false;
      if (min && dateStr < min) isDisabled = true;
      if (max && dateStr > max) isDisabled = true;

      days.push({
        day: dayNum,
        dateString: dateStr,
        isCurrentMonth: false,
        isSelected: value === dateStr,
        isToday: todayStr === dateStr,
        isDisabled,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateStr = formatDateString(viewYear, viewMonth, dayNum);

      let isDisabled = false;
      if (min && dateStr < min) isDisabled = true;
      if (max && dateStr > max) isDisabled = true;

      days.push({
        day: dayNum,
        dateString: dateStr,
        isCurrentMonth: true,
        isSelected: value === dateStr,
        isToday: todayStr === dateStr,
        isDisabled,
      });
    }

    // Next month padding to fill out 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = formatDateString(nextYear, nextMonth, dayNum);

      let isDisabled = false;
      if (min && dateStr < min) isDisabled = true;
      if (max && dateStr > max) isDisabled = true;

      days.push({
        day: dayNum,
        dateString: dateStr,
        isCurrentMonth: false,
        isSelected: value === dateStr,
        isToday: todayStr === dateStr,
        isDisabled,
      });
    }

    return days;
  }, [viewYear, viewMonth, value, min, max]);

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleSelectToday = () => {
    const now = new Date();
    const todayStr = formatDateString(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    if ((min && todayStr < min) || (max && todayStr > max)) return;
    onChange(todayStr);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setIsOpen(false);
  };

  return (
    <div
      className={cn("space-y-1.5 w-full min-w-0", containerClassName)}
      ref={containerRef}
    >
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-foreground flex items-center justify-between gap-1 select-none"
        >
          <span className="flex items-center gap-1.5 truncate">
            {label} {required && <span className="text-destructive">*</span>}
          </span>
          {ethiopianInfo && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              {ethiopianInfo.formatted}
            </span>
          )}
        </label>
      )}

      <div className="relative w-full min-w-0">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={cn(
            "w-full h-10 px-3.5 rounded-xl border text-xs sm:text-sm text-foreground flex items-center justify-between gap-2 transition-all cursor-pointer select-none text-left min-w-0",
            isOpen
              ? "bg-background border-primary ring-2 ring-primary/20 shadow-xs"
              : "bg-card border-border hover:bg-muted/60 hover:border-muted-foreground/30",
            disabled && "opacity-60 cursor-not-allowed bg-muted/40",
            error && "border-destructive ring-2 ring-destructive/20",
            className
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate">
            <CalendarIcon
              size={16}
              className={cn(
                "shrink-0",
                value ? "text-primary" : "text-muted-foreground/80"
              )}
            />
            <span
              className={cn(
                "truncate font-medium",
                !value && "text-muted-foreground/70"
              )}
            >
              {value ? formatDisplayDate(value) : placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-1 text-muted-foreground">
            {ethiopianInfo && (
              <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                {ethiopianInfo.formatted}
              </span>
            )}

            {value && !disabled && !required && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear date"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange("");
                  }
                }}
                className="h-5 w-5 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer mr-0.5"
              >
                <X size={12} />
              </span>
            )}

            <ChevronDown
              size={15}
              className={cn(
                "transition-transform duration-200",
                isOpen && "rotate-180 text-foreground"
              )}
            />
          </div>
        </button>

        {/* Dropdown Popover */}
        {isOpen && !disabled && (
          <div
            className={cn(
              "absolute z-50 mt-1.5 w-[calc(100vw-2rem)] max-w-[320px] rounded-xl border border-border bg-card p-3 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {/* Header: Month/Year selector & Navigation */}
            <div className="flex items-center justify-between gap-1 pb-2 border-b border-border/80">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="h-8 w-8 shrink-0 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5 min-w-0">
                {/* Month Selector Button & Floating Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMonthOpen((prev) => !prev);
                      setIsYearOpen(false);
                    }}
                    className={cn(
                      "h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-1.5 transition-all cursor-pointer select-none",
                      isMonthOpen
                        ? "bg-background border-primary text-primary ring-2 ring-primary/20 shadow-2xs"
                        : "bg-muted/40 border-border text-foreground hover:bg-muted/70 hover:border-muted-foreground/30"
                    )}
                  >
                    <span>{MONTH_NAMES[viewMonth]}</span>
                    <ChevronDown
                      size={12}
                      className={cn(
                        "transition-transform duration-200 text-muted-foreground shrink-0",
                        isMonthOpen && "rotate-180 text-primary"
                      )}
                    />
                  </button>

                  {/* Floating Month Menu */}
                  {isMonthOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-[140px] max-h-56 overflow-y-auto rounded-xl border border-border bg-card shadow-xl p-1 z-50 animate-in fade-in-0 zoom-in-95 space-y-0.5">
                      {MONTH_NAMES.map((name, idx) => {
                        const isSelected = viewMonth === idx;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setViewMonth(idx);
                              setIsMonthOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left",
                              isSelected
                                ? "bg-primary/10 text-primary font-bold border border-primary/20"
                                : "text-foreground hover:bg-muted/70 font-medium"
                            )}
                          >
                            <span>{name}</span>
                            {isSelected && <Check size={13} className="text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Year Selector Button & Floating Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsYearOpen((prev) => !prev);
                      setIsMonthOpen(false);
                    }}
                    className={cn(
                      "h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-1.5 transition-all cursor-pointer select-none min-w-[70px]",
                      isYearOpen
                        ? "bg-background border-primary text-primary ring-2 ring-primary/20 shadow-2xs"
                        : "bg-muted/40 border-border text-foreground hover:bg-muted/70 hover:border-muted-foreground/30"
                    )}
                  >
                    <span className="tabular-nums font-semibold">{viewYear}</span>
                    <ChevronDown
                      size={12}
                      className={cn(
                        "transition-transform duration-200 text-muted-foreground shrink-0",
                        isYearOpen && "rotate-180 text-primary"
                      )}
                    />
                  </button>

                  {/* Floating Year Menu */}
                  {isYearOpen && (
                    <div
                      ref={yearMenuRef}
                      className="absolute top-full right-0 mt-1.5 w-[90px] max-h-56 overflow-y-auto rounded-xl border border-border bg-card shadow-xl p-1 z-50 animate-in fade-in-0 zoom-in-95 space-y-0.5"
                    >
                      {yearsList.map((y) => {
                        const isSelected = viewYear === y;
                        return (
                          <button
                            key={y}
                            type="button"
                            data-selected={isSelected}
                            onClick={() => {
                              setViewYear(y);
                              setIsYearOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left tabular-nums",
                              isSelected
                                ? "bg-primary/10 text-primary font-bold border border-primary/20"
                                : "text-foreground hover:bg-muted/70 font-medium"
                            )}
                          >
                            <span>{y}</span>
                            {isSelected && <Check size={13} className="text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="h-8 w-8 shrink-0 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Ethiopian Month Subtitle */}
            {viewMonthEthiopianInfo && (
              <div className="pt-1.5 pb-1 px-1 text-center">
                <span className="text-[11px] font-medium text-muted-foreground/80">
                  Ethiopian Calendar:{" "}
                  <span className="font-semibold text-foreground">
                    {viewMonthEthiopianInfo.formatted}
                  </span>
                </span>
              </div>
            )}

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center">
              {DAYS_OF_WEEK.map((d) => (
                <div
                  key={d}
                  className="text-[11px] font-semibold text-muted-foreground select-none"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {calendarDays.map((item, idx) => {
                return (
                  <button
                    key={`${item.dateString}-${idx}`}
                    type="button"
                    disabled={item.isDisabled}
                    onClick={() => handleSelectDate(item.dateString)}
                    className={cn(
                      "h-8 sm:h-8.5 w-full rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-95",
                      item.isSelected &&
                        "bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/95",
                      !item.isSelected &&
                        item.isCurrentMonth &&
                        "text-foreground hover:bg-muted/70",
                      !item.isSelected &&
                        !item.isCurrentMonth &&
                        "text-muted-foreground/40 hover:bg-muted/40",
                      item.isToday &&
                        !item.isSelected &&
                        "ring-1 ring-primary/40 font-semibold text-primary",
                      item.isDisabled &&
                        "opacity-25 cursor-not-allowed hover:bg-transparent pointer-events-none"
                    )}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>

            {/* Footer Actions: Today & Clear */}
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/60">
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer py-1 px-1.5"
              >
                Today
              </button>

              {value && !required && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer py-1 px-1.5"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-destructive mt-1">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
