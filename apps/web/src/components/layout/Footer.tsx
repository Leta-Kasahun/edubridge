import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Logo } from "@/shared/components";
import { cn } from "@/lib/utils";

const footerLinkClass = cn(
  "relative group px-2.5 py-1 text-xs sm:text-sm font-medium",
  "text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors duration-200"
);

const footerUnderlineClass = cn(
  "absolute bottom-0 left-2.5 right-2.5 h-px rounded-full",
  "bg-primary scale-x-0 group-hover:scale-x-100",
  "transition-transform duration-250 origin-left"
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacts" className="bg-white dark:bg-slate-950 text-foreground border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <Link href={ROUTES.HOME} className="flex items-center">
              <Logo
                variant="full"
                size="sm"
                frame="none"
              />
            </Link>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              &copy; {currentYear} EduBridge. All rights reserved.
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4 gap-y-2">
            <Link href="/#features" className={footerLinkClass}>
              Features
              <span className={footerUnderlineClass} />
            </Link>
            <Link href="/#exam-prep" className={footerLinkClass}>
              Exam Prep
              <span className={footerUnderlineClass} />
            </Link>
            <Link href="/#how-it-works" className={footerLinkClass}>
              How It Works
              <span className={footerUnderlineClass} />
            </Link>
            <span className={cn(footerLinkClass, "cursor-pointer")}>
              Privacy
              <span className={footerUnderlineClass} />
            </span>
            <span className={cn(footerLinkClass, "cursor-pointer")}>
              Terms
              <span className={footerUnderlineClass} />
            </span>
            <a href="mailto:edubridge.et@gmail.com" className={footerLinkClass}>
              Help
              <span className={footerUnderlineClass} />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
