import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type LogoVariant = "full" | "stacked" | "horizontal" | "mark";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type LogoTheme = "light" | "dark" | "auto";
export type LogoFrame = "none" | "subtle" | "pill" | "glass" | "glow";

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  theme?: LogoTheme;
  frame?: LogoFrame;
  width?: number;
  height?: number;
  subtext?: string;
  badgeText?: string;
  withLink?: boolean;
  href?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  onClick?: () => void;
}

const SIZE_MAP: Record<LogoSize, { px: number; textClass: string; subtextClass: string }> = {
  xs: {
    px: 24,
    textClass: "text-[9px]",
    subtextClass: "text-[7px]",
  },
  sm: {
    px: 32,
    textClass: "text-[11px]",
    subtextClass: "text-[8px]",
  },
  md: {
    px: 40,
    textClass: "text-[13px]",
    subtextClass: "text-[9px]",
  },
  lg: {
    px: 50,
    textClass: "text-[15px]",
    subtextClass: "text-[10px]",
  },
  xl: {
    px: 64,
    textClass: "text-[18px]",
    subtextClass: "text-[11px]",
  },
  "2xl": {
    px: 80,
    textClass: "text-[22px]",
    subtextClass: "text-[12px]",
  },
};

export function Logo({
  variant = "full",
  size = "sm",
  theme = "auto",
  frame = "none",
  width,
  height,
  subtext,
  badgeText,
  withLink = false,
  href = "/",
  priority = false,
  className,
  imageClassName,
  textClassName,
  onClick,
}: LogoProps) {
  const sizeConfig = SIZE_MAP[size];
  const pixelSize = width ?? sizeConfig.px;
  const pixelHeight = height ?? pixelSize;

  const isStacked = variant === "full" || variant === "stacked";

  const frameClasses: Record<LogoFrame, string> = {
    none: "",
    subtle:
      theme === "dark"
        ? "bg-white/10 p-1.5 rounded-xl border border-white/15 backdrop-blur-xs shadow-xs"
        : "bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-xs",
    pill:
      theme === "dark"
        ? "bg-slate-900/80 p-2 rounded-full border border-white/15 shadow-sm"
        : "bg-white p-2 rounded-full border border-slate-200 shadow-sm",
    glass:
      "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm",
    glow:
      "bg-white p-2 rounded-2xl border border-blue-500/30 shadow-[0_0_18px_rgba(37,99,235,0.25)]",
  };

  const badgeThemeClasses = {
    light: "bg-blue-50 text-blue-700 border-blue-200",
    dark: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    auto: "bg-primary/10 text-primary border-primary/20",
  }[theme];

  const subtextThemeClasses = {
    light: "text-slate-500",
    dark: "text-slate-400",
    auto: "text-muted-foreground",
  }[theme];

  const content = (
    <div
      className={cn(
        "inline-flex transition-all duration-200 select-none group",
        isStacked
          ? "flex-col items-center justify-center text-center gap-0.5"
          : "items-center gap-2.5",
        className
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-[1.04]",
          frame !== "none" && frameClasses[frame]
        )}
        style={{ width: pixelSize, height: pixelHeight }}
      >
        <Image
          src="/logo.png"
          alt="EduBridge Logo"
          width={pixelSize}
          height={pixelHeight}
          priority={priority}
          sizes={`${pixelSize}px`}
          className={cn("h-full w-full object-contain rounded-md drop-shadow-xs", imageClassName)}
        />
      </div>

      {variant !== "mark" && (
        <div
          className={cn(
            "flex flex-col leading-tight",
            isStacked ? "items-center text-center" : "items-start",
            textClassName
          )}
        >
          <div className="flex items-center justify-center">
            <span
              className={cn(
                "font-extrabold font-heading tracking-tight inline-flex items-center",
                sizeConfig.textClass
              )}
            >
              <span className="bg-gradient-to-r from-[#38BDF8] via-[#00A3FF] to-[#0284C7] dark:from-[#7DD3FC] dark:via-[#38BDF8] dark:to-[#00A3FF] bg-clip-text text-transparent font-extrabold">
                edu
              </span>
              <span className="bg-gradient-to-r from-[#FB923C] via-[#F97316] to-[#EA580C] dark:from-[#FDBA74] dark:via-[#FB923C] dark:to-[#F97316] bg-clip-text text-transparent font-extrabold">
                bridge
              </span>
            </span>

            {badgeText && !isStacked && (
              <span
                className={cn(
                  "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border leading-none tracking-wider ml-1",
                  badgeThemeClasses
                )}
              >
                {badgeText}
              </span>
            )}
          </div>

          {subtext && (
            <span
              className={cn(
                "font-medium uppercase tracking-wider truncate text-center opacity-80",
                sizeConfig.subtextClass,
                subtextThemeClasses
              )}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link
        href={href}
        className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg inline-flex"
      >
        {content}
      </Link>
    );
  }

  return content;
}
