"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Logo } from "@/shared/components/Logo";

export type AuthAsideMode = "login" | "student" | "teacher" | "first-login" | "general";

export interface AuthAsideProps {
  mode?: AuthAsideMode;
  className?: string;
}

interface SlideItem {
  id: AuthAsideMode;
  tabLabel: string;
  title: string;
  image: string;
  alt: string;
  kenBurns: string;
}

const SLIDES: readonly SlideItem[] = [
  {
    id: "login",
    tabLabel: "Students",
    title: "Master every subject with confidence",
    image: "/hero1.jpg",
    alt: "Ethiopian students learning with digital tools",
    kenBurns: "hero-ken-burns-a",
  },
  {
    id: "teacher",
    tabLabel: "Teachers",
    title: "Inspire every classroom with ease",
    image: "/hero1.jpg",
    alt: "Ethiopian educator and students in classroom",
    kenBurns: "hero-ken-burns-b",
  },
  {
    id: "first-login",
    tabLabel: "Account Setup",
    title: "Activate your school account in seconds",
    image: "/hero1.jpg",
    alt: "Ethiopian students activating school portal",
    kenBurns: "hero-ken-burns-c",
  },
  {
    id: "general",
    tabLabel: "Campus Hub",
    title: "Your complete school hub in one place",
    image: "/hero1.jpg",
    alt: "Ethiopian students and teacher learning together",
    kenBurns: "hero-ken-burns-d",
  },
];

export function AuthAside({ mode = "login", className }: AuthAsideProps) {
  // Analogically map the initial slide to the active auth flow
  const initialIndex = useMemo(() => {
    switch (mode) {
      case "teacher":
        return 1;
      case "first-login":
        return 2;
      case "general":
        return 3;
      case "student":
      case "login":
      default:
        return 0;
    }
  }, [mode]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync when mode changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const advanceTo = useCallback((nextIndex: number) => {
    setCurrentIndex(nextIndex);
  }, []);

  return (
    <aside
      className={cn(
        "relative w-full h-full min-h-[580px] rounded-[28px] lg:rounded-[32px] overflow-hidden select-none bg-slate-950 shadow-xl flex flex-col justify-between",
        className
      )}
    >
      {/* Background Photograph Layers with Continuous Smooth Video Motion (No sudden flips) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 overflow-hidden transition-opacity duration-[1800ms] ease-in-out will-change-transform",
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              )}
            >
              {/* Continuous silky ambient video drift (Ken Burns) */}
              <div className={cn("absolute inset-0 w-full h-full", isActive && slide.kenBurns)}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  quality={92}
                  className="object-cover object-center"
                />
              </div>
            </div>
          );
        })}

        {/* Cinematic Gradient: Dark fade at bottom for pure text contrast */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/60 via-45% to-transparent pointer-events-none" />
      </div>

      {/* Top Bar with Top-Left Notch & Interactive Story Navigation */}
      <div className="relative z-30 w-full flex items-start justify-between">
        {/* Top-Left Organic Curved Notch with Small Logo */}
        <div className="relative flex items-center">
          {/* SVG Cutout Notch matching the reference design */}
          <svg
            viewBox="0 0 100 80"
            className="absolute top-0 left-0 z-20 text-background fill-current pointer-events-none drop-shadow-xs"
            style={{ width: "100px", height: "80px" }}
            aria-hidden="true"
          >
            <path d="M 0 0 L 68 0 C 78 0 82 8 84 18 L 84 36 C 84 48 76 56 64 56 L 24 56 C 10 56 0 66 0 78 Z" />
          </svg>

          {/* Clean Stylized Brand Mark inside the notch */}
          <div className="relative z-30 pt-3.5 pl-3.5 sm:pt-4 sm:pl-4">
            <Link
              href={ROUTES.HOME}
              className="flex items-center justify-center transition-transform duration-200 hover:scale-105"
              title="EduBridge Home"
            >
              <Logo
                variant="mark"
                size="sm"
                priority
              />
            </Link>
          </div>
        </div>

        {/* Top Segmented Story Indicators (Clean, calm, clickable without distracting auto-jumps) */}
        <div className="pt-6 pr-6 sm:pr-8 flex items-center gap-1.5 w-36 sm:w-48">
          {SLIDES.map((slide, index) => {
            const isCurrent = index === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => advanceTo(index)}
                className="flex-1 h-1 rounded-full overflow-hidden cursor-pointer transition-all duration-300 group"
                aria-label={`Switch to ${slide.tabLabel}`}
                title={slide.tabLabel}
              >
                <div
                  className={cn(
                    "h-full w-full rounded-full transition-all duration-500",
                    isCurrent
                      ? "bg-white opacity-100 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                      : "bg-white/30 opacity-60 group-hover:bg-white/60"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Area: Silk-Smooth Crossfading Headline & Minimal Footer */}
      <div className="relative z-30 p-6 sm:p-10 lg:p-12 pb-6 sm:pb-8 flex flex-col justify-end space-y-5">
        {/* Headline Container with Cross-Fade */}
        <div className="relative min-h-[5.5rem] sm:min-h-[6.5rem] flex items-end">
          {SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;

            return (
              <h1
                key={slide.id}
                className={cn(
                  "absolute inset-x-0 bottom-0 text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-white tracking-tight leading-[1.14] max-w-sm sm:max-w-md drop-shadow-sm transition-all duration-[1200ms] ease-in-out will-change-[opacity,transform]",
                  isActive
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1 pointer-events-none"
                )}
              >
                {slide.title}
              </h1>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-white/55 pt-2">
          <span>© EduBridge. 2026</span>
          <span className="text-white/30">|</span>
          <Link href="/help" className="hover:text-white/90 transition-colors">
            Help Center
          </Link>
          <span className="text-white/30">|</span>
          <Link href="/terms" className="hover:text-white/90 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </aside>
  );
}
