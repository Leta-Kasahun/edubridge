import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Logo } from "@/shared/components";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacts" className="border-t border-border bg-card text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href={ROUTES.HOME} className="inline-block group">
              <Logo
                variant="full"
                size="sm"
                frame="none"
                subtext="Educational Intelligence Platform"
              />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-supported exam preparation and practice questions for Grade 8 and Grade 12 students in Ethiopia.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
              <Sparkles size={14} />
              <span>Teacher-Approved AI Learning</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground tracking-tight uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/#features" className="hover:text-foreground transition-colors">
                  Practice Features
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-foreground transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/#contacts" className="hover:text-foreground transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground tracking-tight uppercase">
              Student Portals
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href={ROUTES.AUTH.FIRST_LOGIN_SETUP} className="hover:text-foreground transition-colors">
                  First-Time Account Activation
                </Link>
              </li>
              <li>
                <Link href={ROUTES.AUTH.LOGIN} className="hover:text-foreground transition-colors">
                  Student &amp; Teacher Login
                </Link>
              </li>
              <li>
                <Link href={ROUTES.AUTH.RESET_PASSWORD} className="hover:text-foreground transition-colors">
                  Reset Password
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground tracking-tight uppercase">
              Contact
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} className="text-primary shrink-0" />
                <span>support@edubridge.edu.et</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} className="text-primary shrink-0" />
                <span>+251 11 667 8900</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Globe size={14} className="text-primary shrink-0" />
                <span>Mon – Fri: 8:00 AM – 5:30 PM EAT</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>&copy; {currentYear} EduBridge. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
