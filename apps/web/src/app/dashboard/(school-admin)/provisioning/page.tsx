"use client";

import Link from "next/link";
import { Users, GraduationCap, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface OnboardingSectionItem {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly icon: React.ElementType;
  readonly badge: string;
}

const ONBOARDING_SECTIONS: readonly OnboardingSectionItem[] = [
  {
    title: "Teachers",
    description:
      "Onboard teaching faculty, manage employee codes, and distribute credentials.",
    href: ROUTES.PROVISIONING.TEACHERS,
    icon: GraduationCap,
    badge: "Faculty",
  },
  {
    title: "Students",
    description:
      "Enroll students across grades and sections with bulk CSV import and credentials.",
    href: ROUTES.PROVISIONING.STUDENTS,
    icon: Users,
    badge: "Students",
  },
];

export default function OnboardingOverviewPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
      {ONBOARDING_SECTIONS.map((sec) => {
        const Icon = sec.icon;

        return (
          <Link
            key={sec.href}
            href={sec.href}
            className="bg-card rounded-2xl border border-border p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon size={22} />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {sec.badge}
                </span>
              </div>

              <h2 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {sec.title}
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {sec.description}
              </p>
            </div>

            <div className="pt-4 border-t border-border mt-5 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Manage</span>
              <ChevronRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
