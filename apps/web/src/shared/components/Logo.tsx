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

const SIZE_CONFIG: Record<
  LogoSize,
  {
    logoHeight: number;
    logoWidth: number;
    markSize: number;
    containerClass: string;
    subtextClass: string;
  }
> = {
  xs: {
    logoHeight: 22,
    logoWidth: 115,
    markSize: 24,
    containerClass: "h-5 sm:h-6",
    subtextClass: "text-[9px]",
  },
  sm: {
    logoHeight: 28,
    logoWidth: 146,
    markSize: 32,
    containerClass: "h-7 sm:h-8",
    subtextClass: "text-[10px]",
  },
  md: {
    logoHeight: 36,
    logoWidth: 188,
    markSize: 40,
    containerClass: "h-9 sm:h-10",
    subtextClass: "text-xs",
  },
  lg: {
    logoHeight: 46,
    logoWidth: 240,
    markSize: 48,
    containerClass: "h-11 sm:h-12",
    subtextClass: "text-sm",
  },
  xl: {
    logoHeight: 58,
    logoWidth: 303,
    markSize: 60,
    containerClass: "h-14 sm:h-16",
    subtextClass: "text-base",
  },
  "2xl": {
    logoHeight: 76,
    logoWidth: 397,
    markSize: 76,
    containerClass: "h-18 sm:h-20",
    subtextClass: "text-lg",
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
  const config = SIZE_CONFIG[size];
  const isMark = variant === "mark";

  const markPixelSize = width ?? height ?? config.markSize;
  const logoPixelHeight = height ?? config.logoHeight;
  const logoPixelWidth = width ?? (height ? Math.round(height * (570 / 109)) : config.logoWidth);

  const frameClasses: Record<LogoFrame, string> = {
    none: "",
    subtle:
      theme === "dark"
        ? "bg-white/10 p-1.5 rounded-xl border border-white/15 backdrop-blur-xs shadow-xs"
        : "bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-xs",
    pill:
      theme === "dark"
        ? "bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/15 shadow-sm"
        : "bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm",
    glass:
      "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm",
    glow:
      "bg-white dark:bg-slate-950 px-2.5 py-1.5 rounded-2xl border border-orange-500/30 shadow-[0_0_18px_rgba(249,115,22,0.25)]",
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
        "inline-flex flex-col items-start leading-tight select-none group transition-all duration-200",
        frame !== "none" && frameClasses[frame],
        className
      )}
      onClick={onClick}
    >
      <div className={cn("inline-flex items-center gap-2", textClassName)}>
        {isMark ? (
          /* Exact Iconic Stylized 'E' Mark for Collapsed / Compact Nav */
          <div
            className="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-[1.04]"
            style={{ width: markPixelSize, height: markPixelSize }}
          >
            <Image
              src="/edubridge-mark.png"
              alt="EduBridge Mark"
              width={markPixelSize}
              height={markPixelSize}
              priority={priority}
              className={cn(
                "h-full w-full object-contain drop-shadow-xs dark:drop-shadow-[0_1px_8px_rgba(255,165,0,0.25)]",
                imageClassName
              )}
            />
          </div>
        ) : (
          /* Exact Custom Stylized Text Logo: Orange 'Edu' + Blue 'Bridge' with Leaf on 'i' */
          <div
            className={cn(
              "relative flex items-center shrink-0 transition-transform duration-300 group-hover:scale-[1.02]",
              config.containerClass
            )}
            style={
              height || width
                ? { height: logoPixelHeight, width: logoPixelWidth }
                : undefined
            }
          >
            <Image
              src="/edubridge-text-logo.png"
              alt="EduBridge"
              width={logoPixelWidth}
              height={logoPixelHeight}
              priority={priority}
              className={cn(
                "h-full w-auto object-contain drop-shadow-xs dark:drop-shadow-[0_1px_10px_rgba(255,255,255,0.12)]",
                imageClassName
              )}
            />
          </div>
        )}

        {badgeText && !isMark && (
          <span
            className={cn(
              "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border leading-none tracking-wider shrink-0",
              badgeThemeClasses
            )}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subtext && !isMark && (
        <span
          className={cn(
            "font-medium uppercase tracking-wider truncate opacity-80 mt-0.5 pl-0.5",
            config.subtextClass,
            subtextThemeClasses
          )}
        >
          {subtext}
        </span>
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

