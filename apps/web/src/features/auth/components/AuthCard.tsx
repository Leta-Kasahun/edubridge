import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export interface AuthCardProps {
  title: string | ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  backHref?: string;
  backLabel?: string;
  showBack?: boolean;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  imageSrc = "/auth.png",
  imageAlt = "EduBridge Authentication",
  backHref = ROUTES.HOME,
  backLabel = "Back to Home",
  showBack = true,
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

        {showBack && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white hover:text-white/85 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20 transition-all duration-200 shadow-xs active:scale-95"
            >
              <ArrowLeft size={16} className="text-white" />
              <span className="text-white font-medium">{backLabel}</span>
            </Link>
          </div>
        )}
      </div>

      <div className="order-2 w-full min-h-full flex items-center justify-center p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 overflow-y-auto">
        <div className="w-full max-w-md xl:max-w-lg space-y-6 sm:space-y-8 my-auto">
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
