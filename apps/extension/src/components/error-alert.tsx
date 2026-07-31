import { AlertCircle, X } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div className="alert-enter p-3 bg-destructive/5 border border-destructive/20 rounded-lg flex items-start gap-3 shadow-sm">
      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
      <p className="text-[13px] text-destructive flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors p-0.5 -m-0.5 rounded"
        aria-label="Dismiss error"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
