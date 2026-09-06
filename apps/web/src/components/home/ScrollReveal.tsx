"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly threshold?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 50,
  threshold = 0.12,
}: ScrollRevealProps) {
  const [hasEntered, setHasEntered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    const currentTarget = elementRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: "1150ms",
        transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        transitionDelay: `${delay}ms`,
      }}
      className={cn(
        "transition-all will-change-transform ease-out",
        hasEntered
          ? "opacity-100 translate-y-0 scale-100 blur-none"
          : "opacity-0 translate-y-10 scale-[0.985] blur-[2px] pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  );
}
