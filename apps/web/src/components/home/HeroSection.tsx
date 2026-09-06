"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface HeroSlide {
  readonly image: string;
  readonly alt: string;
  readonly kenBurns: string;
}

const HERO_SLIDES: readonly HeroSlide[] = [
  { image: "/hero1.jpg", alt: "EduBridge Classroom Learning", kenBurns: "hero-ken-burns-a" },
  { image: "/hero.png", alt: "EduBridge Platform Overview", kenBurns: "hero-ken-burns-b" },
  { image: "/hero2.png", alt: "EduBridge Student Assessments", kenBurns: "hero-ken-burns-c" },
  { image: "/hero3.jpg", alt: "EduBridge Topic Progress", kenBurns: "hero-ken-burns-d" },
];

const DISPLAY_DURATION_MS = 7000;
const FADE_DURATION_MS = 2400;

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  const advanceTo = useCallback((nextIndex: number) => {
    if (fading) return;
    setPrevIndex(currentIndex);
    setCurrentIndex(nextIndex);
    setFading(true);
    const clear = setTimeout(() => {
      setPrevIndex(null);
      setFading(false);
    }, FADE_DURATION_MS);
    return clear;
  }, [currentIndex, fading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = (currentIndex + 1) % HERO_SLIDES.length;
      advanceTo(next);
    }, DISPLAY_DURATION_MS);
    return () => clearTimeout(timer);
  }, [currentIndex, fading]);

  const handleDotClick = (index: number) => {
    if (index === currentIndex || fading) return;
    advanceTo(index);
  };

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-slate-100 min-h-[420px] sm:min-h-[540px] md:min-h-[600px] flex items-center">
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => {
          const isCurrent = index === currentIndex;
          const isPrev = index === prevIndex;
          const isVisible = isCurrent || isPrev;

          return (
            <div
              key={slide.image}
              aria-hidden={!isCurrent}
              className="absolute inset-0 overflow-hidden"
              style={{
                zIndex: isPrev ? 10 : isCurrent ? 15 : 0,
                opacity: isPrev ? (fading ? 0 : 1) : isCurrent ? 1 : 0,
                transition: fading
                  ? `opacity ${FADE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.25, 1)`
                  : isPrev
                    ? `opacity ${FADE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.25, 1)`
                    : "none",
                pointerEvents: isCurrent ? "auto" : "none",
              }}
            >
              <div className={cn("absolute inset-0", slide.kenBurns)}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                  quality={90}
                  className="object-cover object-center"
                />
              </div>
            </div>
          );
        })}

        <div className="absolute inset-0 z-20 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/25" />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/15" />
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-24 w-full">
        <div className="max-w-3xl space-y-6 text-left">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-5xl md:text-6xl font-light tracking-tight text-white leading-tight">
              Make Learning Easier. <br />
              <span className="font-normal text-sky-400">
                Help Every Student Move Forward.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg font-light text-slate-200 leading-relaxed max-w-2xl">
              EduBridge brings learning, teaching, practice, assessments, and student progress together in one simple platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className={cn(
                buttonVariants({ size: "lg" }),
                "text-xs sm:text-sm font-medium gap-2 px-6 py-5 rounded-xl",
                "shadow-[0_4px_20px_rgba(14,165,233,0.3)] justify-center"
              )}
            >
              <span>Access Portal</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "text-xs sm:text-sm font-normal px-6 py-5 rounded-xl",
                "border-slate-600/70 bg-slate-900/40 text-slate-200",
                "hover:bg-slate-800/60 hover:text-white backdrop-blur-md justify-center",
                "transition-colors duration-200"
              )}
            >
              <ShieldCheck size={15} className="text-slate-300" />
              <span>First Login Setup</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 pt-3">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.image}
                type="button"
                aria-label={`View slide ${index + 1}`}
                onClick={() => handleDotClick(index)}
                className={cn(
                  "h-1 rounded-full transition-all duration-700",
                  index === currentIndex
                    ? "w-8 bg-sky-400"
                    : "w-2 bg-slate-600 hover:bg-slate-400"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
