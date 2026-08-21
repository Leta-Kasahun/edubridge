import Link from "next/link";
import { Shield, Sliders, ChevronRight, Lock } from "lucide-react";
import { DashboardLayout } from "@/shared/components/layouts";

const SETTINGS_SECTIONS = [
  {
    title: "Security Policy",
    description: "Password complexity, session expiry, 2FA enforcement, and login controls.",
    href: "/settings/security",
    icon: Lock,
    badge: "Policy Control",
  },
  {
    title: "Roles & Access",
    description: "Configure administrative and faculty user roles with granular module permissions.",
    href: "/settings/roles",
    icon: Shield,
    badge: "RBAC Engine",
  },
  {
    title: "School Preferences",
    description: "Tenant feature flags, attendance grace rules, and institutional defaults.",
    href: "/settings/preferences",
    icon: Sliders,
    badge: "Lookups",
  },
];

export default function SettingsOverviewPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {SETTINGS_SECTIONS.map((sec) => {
          const Icon = sec.icon;

          return (
            <Link
              key={sec.href}
              href={sec.href}
              className="bg-card rounded-2xl border border-border p-5 shadow-2xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
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

                <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {sec.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {sec.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Configure</span>
                <ChevronRight size={15} />
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
