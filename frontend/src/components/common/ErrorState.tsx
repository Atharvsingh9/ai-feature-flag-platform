import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  offline?: boolean;
}

export function ErrorState({ message, onRetry, offline }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-4 text-center"
    >
      {offline ? (
        <WifiOff className="h-10 w-10 text-ink-300" aria-hidden="true" />
      ) : (
        <AlertTriangle className="h-10 w-10 text-error" aria-hidden="true" />
      )}
      <div>
        <p className="text-sm font-medium text-ink-900">
          {offline ? "No internet connection" : "Something went wrong"}
        </p>
        <p className="mt-1 text-sm text-ink-500">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ message, icon: Icon }: { message: string; icon?: any }) {
  const IconComponent = Icon || AlertTriangle;
  return (
    <div
      role="status"
      className="flex h-full min-h-[150px] w-full flex-col items-center justify-center gap-2 text-center"
    >
      <IconComponent className="h-8 w-8 text-ink-300" aria-hidden="true" />
      <p className="text-sm text-ink-500">{message}</p>
    </div>
  );
}
