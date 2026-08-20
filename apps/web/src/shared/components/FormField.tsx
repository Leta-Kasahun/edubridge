import { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  action?: ReactNode;
  error?: string;
  hint?: string;
  containerClassName?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      id,
      label,
      action,
      error,
      hint,
      className,
      containerClassName,
      leftIcon,
      rightIcon,
      isPassword = false,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={cn("space-y-2 w-full", containerClassName)}>
        {(label || action) && (
          <div className="flex items-center justify-between gap-2">
            {label && (
              <Label
                htmlFor={id}
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider text-foreground/80 select-none",
                  error && "text-destructive"
                )}
              >
                {label}
              </Label>
            )}
            {action && (
              <div className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                {action}
              </div>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground/80">
              {leftIcon}
            </div>
          )}
          <Input
            id={id}
            ref={ref}
            type={inputType}
            className={cn(
              "h-11 sm:h-12 w-full rounded-xl border border-input bg-background/50 px-3.5 text-sm sm:text-base font-normal shadow-xs transition-all duration-200 placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
              leftIcon && "pl-11",
              (rightIcon || isPassword) && "pr-11",
              error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
              className
            )}
            aria-invalid={Boolean(error)}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-muted/40 active:scale-95 transition-all"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 flex items-center pointer-events-none text-muted-foreground/70">
                {rightIcon}
              </div>
            )
          )}
        </div>
        {error && <p className="text-xs text-destructive font-medium tracking-tight">{error}</p>}
        {!error && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";
