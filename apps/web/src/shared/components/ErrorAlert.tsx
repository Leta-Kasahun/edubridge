import { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorAlertProps {
  title?: string;
  message?: ReactNode;
  className?: string;
}

export function ErrorAlert({
  title,
  message,
  className,
}: ErrorAlertProps) {
  if (!message && !title) return null;

  return (
    <Alert variant="destructive" className={cn("w-full", className)}>
      <AlertCircle className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      {message && <AlertDescription>{message}</AlertDescription>}
    </Alert>
  );
}
