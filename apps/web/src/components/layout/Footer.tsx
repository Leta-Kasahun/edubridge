import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap size={18} className="stroke-[2.2]" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">EduBridge</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm">
            <Link href={ROUTES.HOME} className="hover:text-foreground transition-colors">
              Platform
            </Link>
            <Link href={ROUTES.AUTH.LOGIN} className="hover:text-foreground transition-colors">
              Student Portal
            </Link>
            <Link href={ROUTES.AUTH.LOGIN} className="hover:text-foreground transition-colors">
              Faculty Login
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} EduBridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
