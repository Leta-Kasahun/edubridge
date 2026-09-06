import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Logo } from "@/shared/components";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacts" className="bg-white dark:bg-slate-950 text-foreground border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <Link href={ROUTES.HOME} className="flex items-center">
              <Logo
                variant="full"
                size="sm"
                frame="none"
              />
            </Link>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              &copy; {currentYear} EduBridge. All rights reserved.
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-muted-foreground">
            <Link href="/#features" className="hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="/#exam-prep" className="hover:text-primary transition-colors">
              Exam Prep
            </Link>
            <Link href="/#how-it-works" className="hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/#faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link href={ROUTES.AUTH.LOGIN} className="hover:text-primary transition-colors">
              Sign In
            </Link>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Terms
            </span>
            <a href="mailto:edubridge.et@gmail.com" className="hover:text-primary transition-colors">
              Help
            </a>
          </nav>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-900 flex sm:hidden items-center justify-center text-xs text-muted-foreground">
          <p>&copy; {currentYear} EduBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
