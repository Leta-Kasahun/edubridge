import { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/lib/utils";

export interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SubmitButton({
  isLoading = false,
  loadingText,
  children,
  icon,
  iconPosition = "right",
  className,
  disabled,
  variant = "default",
  size = "default",
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={cn(
        "rounded-xl font-semibold shadow-xs transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2",
        size === "sm"
          ? "w-auto h-9 text-xs px-4"
          : "w-full h-11 sm:h-12 text-sm sm:text-base",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner size={size === "sm" ? 14 : 18} />
          <span>{loadingText || children}</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
        </span>
      )}
    </Button>
  );
}
