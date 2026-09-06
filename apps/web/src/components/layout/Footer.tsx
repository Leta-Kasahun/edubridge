import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Logo } from "@/shared/components";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacts" className="border-t border-border bg-card text-muted-foreground">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
          <div className="space-y-3">
            <Link href={ROUTES.HOME} className="inline-block">
              <Logo
                variant="full"
                size="sm"
                frame="none"
              />
            </Link>
            <p className="text-xs font-normal text-muted-foreground leading-relaxed">
              Unified platform for teaching, learning, assessments, and student progress for Grade 7 to 12.
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-medium text-foreground uppercase tracking-wider block">
              Legal &amp; Privacy
            </span>
            <ul className="space-y-2">
              <li>
                <span className="text-xs font-normal text-muted-foreground hover:text-primary transition-colors cursor-pointer block">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-xs font-normal text-muted-foreground hover:text-primary transition-colors cursor-pointer block">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-xs font-normal text-muted-foreground hover:text-primary transition-colors cursor-pointer block">
                  Data Protection
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-medium text-foreground uppercase tracking-wider block">
              School Portals
            </span>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.AUTH.FIRST_LOGIN_SETUP} className="text-xs font-normal text-muted-foreground hover:text-primary transition-colors block">
                  First Login Setup
                </Link>
              </li>
              <li>
                <Link href={ROUTES.AUTH.LOGIN} className="text-xs font-normal text-muted-foreground hover:text-primary transition-colors block">
                  Account Login
                </Link>
              </li>
              <li>
                <Link href={ROUTES.AUTH.RESET_PASSWORD} className="text-xs font-normal text-muted-foreground hover:text-primary transition-colors block">
                  Change Password
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-medium text-foreground uppercase tracking-wider block">
              Contact
            </span>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <MapPin size={13} className="shrink-0 text-muted-foreground" />
                <span className="text-xs font-normal text-muted-foreground">Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <Mail size={13} className="shrink-0 text-muted-foreground" />
                <span className="text-xs font-normal text-muted-foreground">support@edubridge.edu.et</span>
              </li>
              <li className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <Phone size={13} className="shrink-0 text-muted-foreground" />
                <span className="text-xs font-normal text-muted-foreground">+251 11 667 8900</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-normal text-muted-foreground">
          <p className="text-xs font-normal text-muted-foreground">&copy; {currentYear} EduBridge. All rights reserved.</p>
          <span className="text-xs font-normal text-muted-foreground">For Schools &amp; Learning Institutions</span>
        </div>
      </div>
    </footer>
  );
}
