import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Logo } from "@/shared/components/Logo";

export interface AuthCardProps {
  title: string | ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  showLogo?: boolean;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  imageSrc = "/auth.png",
  imageAlt = "EduBridge Authentication",
  showLogo = true,
  className,
}: AuthCardProps) {
  return (
    <div className={cn("w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background", className)}>
      <div className="order-1 relative w-full h-48 sm:h-56 md:h-64 lg:h-full lg:min-h-screen bg-slate-950 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center"
        />

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <Link href={ROUTES.HOME} className="flex items-center" title="EduBridge Home">
            <Logo variant="full" size="sm" theme="dark" frame="none" priority />
          </Link>
        </div>
      </div>

      <div className="order-2 w-full min-h-full flex items-center justify-center p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 overflow-y-auto">
        <div className="w-full max-w-md xl:max-w-lg space-y-6 sm:space-y-8 my-auto">
          {showLogo && (
            <div className="flex justify-center lg:hidden pb-1">
              <Link href={ROUTES.HOME} title="EduBridge Home">
                <Logo variant="full" size="sm" frame="none" priority />
              </Link>
            </div>
          )}

          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-heading">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div>{children}</div>

          {footer && (
            <div className="pt-6 text-center text-xs sm:text-sm text-muted-foreground border-t border-border/60">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
