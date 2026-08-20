import { LucideProps, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps extends LucideProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({
  className,
  size = 20,
  ...props
}: LoadingSpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn("animate-spin text-current", className)}
      {...props}
    />
  );
}
