import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Logo } from "@/shared/components/Logo";
import { AuthAside, AuthAsideMode } from "./AuthAside";

export interface AuthCardProps {
  title: string | ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  showLogo?: boolean;
  className?: string;
  asideMode?: AuthAsideMode;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  showLogo = true,
  className,
  asideMode = "login",
}: AuthCardProps) {
  return (
    <div className={cn("w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background", className)}>
      {/* Desktop Video-Style Dynamic Aside */}
      <div className="hidden lg:flex lg:order-1 lg:relative lg:w-full lg:h-screen lg:sticky lg:top-0 p-3 sm:p-4 lg:p-5 xl:p-6 overflow-hidden">
        <AuthAside mode={asideMode} />
      </div>

      {/* Main Authentication Form Area */}
      <div className="order-1 lg:order-2 w-full min-h-screen flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20 overflow-y-auto">
        <div className="w-full max-w-md xl:max-w-lg space-y-6 sm:space-y-8 my-auto">
          {showLogo && (
            <div className="flex justify-center lg:hidden pb-1 sm:pb-2">
              <Link href={ROUTES.HOME} title="EduBridge Home">
                <Logo variant="full" size="md" frame="none" priority />
              </Link>
            </div>
          )}

          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent font-heading">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div>{children}</div>

          {footer && (
            <div className="pt-5 text-center text-xs sm:text-sm text-muted-foreground border-t border-border/60">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
