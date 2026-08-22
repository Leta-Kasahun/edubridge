"use client";

import Link from "next/link";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Building2,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { ROUTES } from "@/constants/routes";

export function SchoolAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Institution"
          value="Active"
          change="Online"
          isPositive={true}
          icon={Building2}
          detail="Institutional portal"
        />
        <MetricCard
          title="School Faculty"
          value="Teachers"
          change="Managed"
          isPositive={true}
          icon={GraduationCap}
          detail="Faculty & staff accounts"
        />
        <MetricCard
          title="School Members"
          value="Active"
          change="Normal"
          isPositive={true}
          icon={Users}
          detail="Enrolled students & faculty"
        />
        <MetricCard
          title="Security Status"
          value="Protected"
          change="Verified"
          isPositive={true}
          icon={ShieldCheck}
          detail="School security policy"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <GraduationCap size={22} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Teacher Management</h2>
                <p className="text-xs text-muted-foreground">
                  Onboard faculty via email invite, credentials, or CSV batch
                </p>
              </div>
            </div>
            <Link
              href={ROUTES.TEACHERS}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
            >
              <UserPlus size={14} />
              <span>Manage Teachers</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Direct handover & invitation onboarding supported</span>
            <Link
              href={ROUTES.TEACHERS}
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              <span>View Table</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">School Security & Roles</h2>
                <p className="text-xs text-muted-foreground">
                  Security policy, password rules, and session controls
                </p>
              </div>
            </div>
            <Link
              href={ROUTES.SETTINGS.SECURITY}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>Configure</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>2FA, login attempts, and password expiry</span>
            <Link
              href={ROUTES.SETTINGS.SECURITY}
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              <span>Security Settings</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
