import { Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type AuthIdentifierMode = "email" | "username";

export interface AuthIdentifierToggleProps {
  readonly mode: AuthIdentifierMode;
  readonly onChange: (mode: AuthIdentifierMode) => void;
  readonly emailLabel?: string;
  readonly usernameLabel?: string;
  readonly className?: string;
}

export function AuthIdentifierToggle({
  mode,
  onChange,
  emailLabel = "Use Email",
  usernameLabel = "Use Username",
  className,
}: AuthIdentifierToggleProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 w-full", className)}>
      <button
        type="button"
        onClick={() => onChange("email")}
        className={cn(
          "h-11 sm:h-12 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer rounded-none active:scale-[0.99]",
          mode === "email"
            ? "border-2 border-primary text-primary bg-primary/5 font-bold"
            : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
        )}
      >
        <Mail size={18} className="shrink-0" />
        <span>{emailLabel}</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("username")}
        className={cn(
          "h-11 sm:h-12 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer rounded-none active:scale-[0.99]",
          mode === "username"
            ? "border-2 border-primary text-primary bg-primary/5 font-bold"
            : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
        )}
      >
        <User size={18} className="shrink-0" />
        <span>{usernameLabel}</span>
      </button>
    </div>
  );
}
