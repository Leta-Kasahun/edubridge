import Link from "next/link";
import { Users, GraduationCap, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const PROVISIONING_SECTIONS = [
  {
    title: "Teacher Provisioning",
    description: "Onboard teaching faculty, manage employee codes, and distribute credentials.",
    href: ROUTES.PROVISIONING.TEACHERS,
    icon: GraduationCap,
    badge: "Faculty",
  },
  {
    title: "Student Provisioning",
    description: "Enroll students across grades and sections with bulk CSV import and credentials.",
    href: ROUTES.PROVISIONING.STUDENTS,
    icon: Users,
    badge: "Students",
  },
];

export default function ProvisioningOverviewPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {PROVISIONING_SECTIONS.map((sec) => {
        const Icon = sec.icon;

        return (
          <Link
            key={sec.href}
            href={sec.href}
            className="bg-card rounded-2xl border border-border p-5 shadow-xs hover:border-foreground/20 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="h-10 w-10 rounded-xl bg-muted text-foreground flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {sec.badge}
                </span>
              </div>

              <h3 className="text-sm font-bold text-foreground mb-1">
                {sec.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {sec.description}
              </p>
            </div>

            <div className="pt-3.5 border-t border-border mt-4 flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Open</span>
              <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
