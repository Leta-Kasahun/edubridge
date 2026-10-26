import { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/shared/components";
import { cn } from "@/lib/utils";

export function KeycloakIcon({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="11" fill="#0088CE" fillOpacity="0.12" stroke="#0088CE" strokeWidth="1.5" />
      <path
        d="M13.5 7.5a3.5 3.5 0 1 0-3.1 5.12L7 16v2h2v-1.5h1.5V15h1l2.12-2.12A3.5 3.5 0 0 0 13.5 7.5zm0 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"
        fill="#0088CE"
      />
    </svg>
  );
}

export interface KeycloakButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  text?: string;
}

export function KeycloakButton({
  isLoading = false,
  text = "Sign in with Keycloak SSO",
  className,
  disabled,
  ...props
}: KeycloakButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || isLoading}
      className={cn(
        "w-full h-11 sm:h-12 rounded-xl text-sm sm:text-base font-medium border border-border/80 bg-background/50 hover:bg-muted/40 hover:text-foreground hover:border-[#0088CE]/40 transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.99] shadow-2xs",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size={18} />
          <span>Connecting with Keycloak...</span>
        </>
      ) : (
        <>
          <KeycloakIcon size={20} className="shrink-0" />
          <span>{text}</span>
        </>
      )}
    </Button>
  );
}
